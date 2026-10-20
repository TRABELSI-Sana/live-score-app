"""Release orchestration checks with fake Maven/Docker; no network or deployment."""
import importlib.util
from pathlib import Path
import subprocess
import tempfile
import re
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("release", ROOT / "deploy.py")
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)


class ReleaseTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in ["backend/pom.xml", "k8s/deployment.yaml", "k8s/configmap.yaml"]:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes((ROOT / name).read_bytes())
        pom = self.root / "backend/pom.xml"
        pom.write_text('''<project xmlns="http://maven.apache.org/POM/4.0.0">
    <parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.5.9</version></parent>
    <artifactId>live-scores</artifactId>
    <version>0.0.1</version>
</project>''')
        deployment = self.root / "k8s/deployment.yaml"
        deployment.write_text(re.sub(r"/(backend|frontend):\d+\.\d+\.\d+", r"/\1:0.0.1", deployment.read_text()))
        self.commands = []
        self.sources = {"backend": "backend-source", "frontend": "frontend-source"}
        self.published = set()
        self.front_push_fails = False
        for name, value in [("ROOT", self.root), ("STATE", self.root / ".release"), ("DEPLOYMENT", self.root / "k8s/deployment.yaml")]:
            self.addCleanup(patch.stopall)
            patch.object(release, name, value).start()
        patch.object(release, "fingerprint", side_effect=lambda app: self.sources[app]).start()
        patch.object(release, "run", side_effect=self.fake_run).start()
        patch.object(release, "output", side_effect=self.output).start()
        self.remote = release.remote_exists
        patch.object(release, "remote_exists", side_effect=lambda ref: ref in self.published).start()

    def output(self, *args):
        if args[0] == "./backend/mvnw":
            return "live-scores-" + release.version()
        return "sha256:" + args[-1]

    def fake_run(self, *args, **kwargs):
        self.commands.append(args)
        if args[0] == "./mvnw":
            path = self.root / "backend/target" / f"live-scores-{release.version()}.jar"
            path.parent.mkdir(exist_ok=True)
            path.write_bytes(b"built-jar")
        if args[:3] == ("npm", "run", "build:seo"):
            for name in ("dist", "dist-tn"):
                path = self.root / "frontend" / name
                path.mkdir(parents=True)
                (path / "index.html").write_text("Built frontend")
        if args[:2] == ("docker", "push"):
            if self.front_push_fails and "/frontend:" in args[-1]:
                raise subprocess.CalledProcessError(1, args)
            self.published.add(args[-1])

    def prepare_images(self):
        release.bump("patch")
        release.build_jar("0.0.2")
        release.build_image("backend", "0.0.2")
        release.build_image("frontend", "0.0.2")

    def test_increment_changes_only_project_version_and_runs_nothing(self):
        release.bump("patch")
        self.assertEqual(release.version(), "0.0.2")
        self.assertIn("<version>3.5.9</version>", (self.root / "backend/pom.xml").read_text())
        self.assertEqual(self.commands, [])
        with self.assertRaises(ValueError):
            release.bump("0.0.1")
        with self.assertRaises(ValueError):
            release.bump("0.0.3-SNAPSHOT")

    def test_jar_requires_increment_and_images_require_jar(self):
        with self.assertRaises(ValueError):
            release.build_jar("0.0.1")
        release.bump("patch")
        with self.assertRaises(ValueError):
            release.build_image("frontend", "0.0.2")
        self.assertEqual(self.commands, [])

    def test_build_stages_do_not_push_or_apply(self):
        self.prepare_images()
        self.assertIn(("./mvnw", "--batch-mode", "clean", "install"), self.commands)
        docker_builds = [cmd for cmd in self.commands if cmd[:3] == ("docker", "buildx", "build")]
        self.assertEqual(len(docker_builds), 2)
        for command in docker_builds:
            self.assertIn("--load", command)
            self.assertIn("linux/amd64", command)
            self.assertNotIn("--push", command)
        self.assertFalse(any(cmd[:2] == ("docker", "push") or cmd[0] == "kubectl" for cmd in self.commands))

    def test_changed_source_and_tampered_jar_are_rejected(self):
        release.bump("patch")
        release.build_jar("0.0.2")
        self.sources["backend"] = "edited"
        with self.assertRaises(ValueError):
            release.build_image("backend", "0.0.2")
        self.sources["backend"] = "backend-source"
        (self.root / "backend/target/live-scores-0.0.2.jar").write_bytes(b"tampered")
        with self.assertRaises(ValueError):
            release.build_image("backend", "0.0.2")

    def test_existing_registry_tag_blocks_all_publication(self):
        self.prepare_images()
        self.published.add(release.image("frontend", "0.0.2"))
        with self.assertRaises(ValueError):
            release.push(["backend", "frontend"], "0.0.2")
        self.assertFalse(any(cmd[:2] == ("docker", "push") for cmd in self.commands))

    def test_partial_push_resumes_without_republishing_backend(self):
        self.prepare_images()
        self.front_push_fails = True
        with self.assertRaises(subprocess.CalledProcessError):
            release.push(["backend", "frontend"], "0.0.2")
        self.front_push_fails = False
        release.push(["backend", "frontend"], "0.0.2")
        pushes = [cmd for cmd in self.commands if cmd[:2] == ("docker", "push")]
        self.assertEqual(sum("/backend:" in cmd[-1] for cmd in pushes), 1)
        self.assertEqual(sum("/frontend:" in cmd[-1] for cmd in pushes), 2)
        self.assertTrue(release.receipt("frontend", "0.0.2", "frontend")["pushed"])

    def test_manifest_requires_push_and_writes_reviewable_literal_images(self):
        self.prepare_images()
        with self.assertRaises(ValueError):
            release.manifests("0.0.2")
        release.push(["backend", "frontend"], "0.0.2")
        release.manifests("0.0.2")
        text = release.DEPLOYMENT.read_text()
        self.assertIn("image: " + release.image("backend", "0.0.2"), text)
        self.assertIn("image: " + release.image("frontend", "0.0.2"), text)
        self.assertNotIn("${", text)
        self.assertNotIn(":latest", text)
        self.assertFalse(any(cmd[0] == "kubectl" for cmd in self.commands))
        with self.assertRaises(ValueError):
            release.build_jar("0.0.2")

    def test_auto_pipeline_reuses_only_images_built_from_identical_source(self):
        self.published.add(release.image("backend", "0.0.2"))
        with patch.object(release, "output", return_value=self.sources["backend"]):
            self.assertTrue(release.registry_image_matches_source("backend", "0.0.2"))
        with patch.object(release, "output", return_value="different-source"):
            with self.assertRaises(ValueError):
                release.registry_image_matches_source("backend", "0.0.2")
        self.assertFalse(release.registry_image_matches_source("frontend", "0.0.2"))

    def test_registry_auth_and_network_errors_fail_closed(self):
        for message in ("unauthorized", "lookup ghcr.io: no such host", "connection refused"):
            with patch.object(release.subprocess, "run", return_value=subprocess.CompletedProcess([], 1, "", message)):
                with self.assertRaises(ValueError):
                    self.remote("image:0.0.2")
        with patch.object(release.subprocess, "run", return_value=subprocess.CompletedProcess([], 1, "", "no such manifest: image:0.0.2")):
            self.assertFalse(self.remote("image:0.0.2"))


if __name__ == "__main__":
    unittest.main()

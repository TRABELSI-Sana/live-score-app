#!/usr/bin/env python3
"""Release LiveFoot one explicit step at a time; never applies Kubernetes manifests."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
REGISTRY = "ghcr.io/trabelsi-sana/live-score-app"
STATE = ROOT / ".release"
DEPLOYMENT = ROOT / "k8s/deployment.yaml"


def run(*args, cwd=None):
    print("+ " + shlex.join(str(arg) for arg in args), flush=True)
    subprocess.run([str(arg) for arg in args], cwd=cwd or ROOT, check=True)


def output(*args):
    return subprocess.check_output([str(arg) for arg in args], cwd=ROOT, text=True).strip()


def semver(value):
    if not re.fullmatch(r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)", value):
        raise ValueError("Utiliser une version X.Y.Z sans SNAPSHOT, par exemple 0.0.2.")
    return tuple(map(int, value.split(".")))


def version():
    root = ET.parse(ROOT / "backend/pom.xml").getroot()
    value = root.findtext("{http://maven.apache.org/POM/4.0.0}version", "").strip()
    semver(value)
    return value


def deployed_versions():
    text = DEPLOYMENT.read_text()
    return re.findall(re.escape(REGISTRY) + r"/(?:backend|frontend):(\d+\.\d+\.\d+)\b", text)


def image(app, release):
    return f"{REGISTRY}/{app}:{release}"


def fingerprint(app):
    paths = ["backend"] if app == "backend" else ["frontend", "frontend-image"]
    names = subprocess.check_output(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", *paths], cwd=ROOT
    ).decode().split("\0")
    digest = hashlib.sha256()
    for name in sorted(set(filter(None, names))):
        path = ROOT / name
        digest.update(name.encode())
        digest.update(b"\0")
        digest.update(path.read_bytes() if path.is_file() else b"<deleted>")
    return digest.hexdigest()


def save(name, data):
    STATE.mkdir(exist_ok=True)
    path = STATE / f"{name}.json"
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, indent=2) + "\n")
    temporary.replace(path)


def receipt(name, release, app):
    path = STATE / f"{name}.json"
    if not path.is_file():
        raise ValueError(f"Étape manquante : {name}. Relancer les étapes dans l’ordre du README.")
    data = json.loads(path.read_text())
    if data["version"] != release or data["source"] != fingerprint(app):
        raise ValueError(f"La version ou le code a changé depuis {name}. Reconstruire les artefacts.")
    return data


def bump(target):
    current = version()
    major, minor, patch = semver(current)
    value = {"patch": f"{major}.{minor}.{patch + 1}", "minor": f"{major}.{minor + 1}.0", "major": f"{major + 1}.0.0"}.get(target, target)
    if semver(value) <= max([semver(current), *map(semver, deployed_versions())]):
        raise ValueError("La nouvelle version doit dépasser celle du POM et des images du YAML.")
    pom = ROOT / "backend/pom.xml"
    text, count = re.subn(
        r"(<artifactId>live-scores</artifactId>\s*<version>)[^<]+(</version>)",
        lambda match: match[1] + value + match[2], pom.read_text(), count=1
    )
    if count != 1:
        raise ValueError("Version du projet introuvable dans le POM.")
    pom.write_text(text)
    print(f"Version du POM : {current} → {value}. Prochaine commande : ./deploy.py jar")


def build_jar(release):
    if any(semver(release) <= semver(old) for old in deployed_versions()):
        raise ValueError("Incrémenter d’abord la version : ./deploy.py version patch")
    before = fingerprint("backend")
    run("./mvnw", "--batch-mode", "clean", "install", cwd=ROOT / "backend")
    name = output("./backend/mvnw", "-f", "backend/pom.xml", "help:evaluate", "-Dexpression=project.build.finalName", "-q", "-DforceStdout", "-Dstyle.color=never")
    if not re.fullmatch(r"[A-Za-z0-9_.-]+", name):
        raise ValueError("Nom du JAR Maven invalide.")
    jar = ROOT / "backend/target" / f"{name}.jar"
    if fingerprint("backend") != before:
        raise ValueError("Le code a changé pendant la compilation. Relancer ./deploy.py jar.")
    save("jar", {"version": release, "source": before, "path": str(jar.relative_to(ROOT)), "sha256": hashlib.sha256(jar.read_bytes()).hexdigest()})
    print(f"JAR prêt : {jar.relative_to(ROOT)}")


def build_image(app, release):
    built = receipt("jar", release, "backend")
    before = fingerprint(app)
    if app == "backend":
        jar = ROOT / built["path"]
        if hashlib.sha256(jar.read_bytes()).hexdigest() != built["sha256"]:
            raise ValueError("Le JAR a changé. Relancer ./deploy.py jar.")
        shutil.copy2(jar, ROOT / "backend/app.jar")
        context = "backend"
    else:
        for command in [("npm", "ci"), ("npx", "puppeteer", "browsers", "install", "chrome"), ("npm", "run", "lint"), ("npm", "run", "build:seo")]:
            run(*command, cwd=ROOT / "frontend")
        for name in ("dist", "dist-tn"):
            destination = ROOT / "frontend-image" / name
            if destination.is_symlink():
                raise ValueError(f"Le dossier généré {destination} ne doit pas être un lien symbolique.")
            if destination.exists():
                shutil.rmtree(destination)
            shutil.copytree(ROOT / "frontend" / name, destination)
        context = "frontend-image"
    ref = image(app, release)
    run("docker", "buildx", "build", "--platform", "linux/amd64", "--load", "--label", f"org.opencontainers.image.version={release}", "--label", f"org.livefoot.source.sha256={before}", "--label", "org.opencontainers.image.source=https://github.com/TRABELSI-Sana/live-score-app", "-t", ref, context)
    if fingerprint(app) != before:
        raise ValueError("Le code a changé pendant le build. Reconstruire l’image.")
    save(app, {"version": release, "source": before, "image_id": output("docker", "image", "inspect", "--format", "{{.Id}}", ref), "pushed": False})
    print(f"Image construite localement : {ref}")


def remote_exists(ref):
    result = subprocess.run(["docker", "manifest", "inspect", ref], cwd=ROOT, text=True, capture_output=True)
    if result.returncode == 0:
        return True
    message = (result.stderr + result.stdout).lower()
    if "manifest unknown" in message or "no such manifest" in message:
        return False
    raise ValueError("Impossible de vérifier GHCR. Vérifier docker login ghcr.io et la connexion réseau ; aucune publication effectuée.")


def registry_image_matches_source(app, release):
    ref = image(app, release)
    if not remote_exists(ref):
        return False
    run("docker", "pull", "--platform", "linux/amd64", ref)
    actual = output("docker", "image", "inspect", "--format", '{{index .Config.Labels "org.livefoot.source.sha256"}}', ref)
    if actual != fingerprint(app):
        raise ValueError(f"{ref} est déjà publiée avec un autre code. Incrémenter la version du POM.")
    return True


def push(apps, release):
    pending = []
    # Validate every image before publishing either of them.
    for app in apps:
        built = receipt(app, release, app)
        ref = image(app, release)
        if output("docker", "image", "inspect", "--format", "{{.Id}}", ref) != built["image_id"]:
            raise ValueError(f"L’image locale {app} a changé. La reconstruire.")
        exists = remote_exists(ref)
        if exists and not built.get("pushed"):
            raise ValueError(f"{ref} existe déjà dans GHCR. Incrémenter la version ; les tags publiés ne sont pas écrasés.")
        if exists:
            print(f"Déjà publiée par cette préparation : {ref}")
        else:
            pending.append((app, ref, built))
    for app, ref, built in pending:
        run("docker", "push", ref)
        built["pushed"] = True
        save(app, built)


def manifests(release):
    for app in ("backend", "frontend"):
        built = receipt(app, release, app)
        if not built.get("pushed") or not remote_exists(image(app, release)):
            raise ValueError(f"Publier d’abord {app}:{release} : ./deploy.py push")
    render_deployment(release)
    print(f"YAML prêt : {DEPLOYMENT.relative_to(ROOT)}")
    print(f"  backend  : {image('backend', release)}\n  frontend : {image('frontend', release)}")
    print("Vérifier git diff -- backend/pom.xml k8s/deployment.yaml, puis lancer : kubectl apply -f k8s/")


def render_deployment(release):
    text = DEPLOYMENT.read_text()
    for app in ("backend", "frontend"):
        text, count = re.subn(
            r'(image:\s*["\']?)' + re.escape(REGISTRY + "/" + app) + r'(?::[^\s"\']+|@[^\s"\']+)',
            lambda match: match[1] + image(app, release), text
        )
        if count != 1:
            raise ValueError(f"La référence de l’image {app} est introuvable ou dupliquée dans {DEPLOYMENT}.")
    config = hashlib.sha256((ROOT / "k8s/configmap.yaml").read_bytes()).hexdigest()
    text = re.sub(r'(livefoot.io/config-version:\s*)"[^"]*"', lambda match: match[1] + '"' + config + '"', text)
    if "${" in text:
        raise ValueError("Le Deployment contient encore un paramètre non résolu.")
    DEPLOYMENT.write_text(text)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("version", help="Incrémenter la version du POM").add_argument("target", nargs="?", default="patch")
    commands.add_parser("jar", help="Maven clean install, avec les tests")
    commands.add_parser("image", help="Construire une image localement").add_argument("app", choices=["backend", "frontend"])
    commands.add_parser("push", help="Publier les images déjà construites").add_argument("app", nargs="?", choices=["backend", "frontend"])
    commands.add_parser("manifests", help="Inscrire les images publiées dans le YAML")
    args = parser.parse_args()
    if args.command == "version":
        bump(args.target)
        return
    release = version()
    if args.command == "jar":
        build_jar(release)
    elif args.command == "image":
        build_image(args.app, release)
    elif args.command == "push":
        push([args.app] if args.app else ["backend", "frontend"], release)
    elif args.command == "manifests":
        manifests(release)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        print(f"Erreur : {error}", file=sys.stderr)
        sys.exit(1)

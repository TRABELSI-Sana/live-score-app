# LiveFoot

Scores de football en temps réel : backend Kotlin/Spring Boot, frontend
React/TypeScript, Redis et résumés IA avec Ollama.

## Développement local

```bash
export APIFOOTBALL_KEY='ta-cle-api'
./deploy-local.sh
```

Ce script construit le projet et lance Docker Compose à partir de
`docker-compose-local.yml` et `nginx/default-local.conf`.
Les fichiers préparés dans `.local-deploy/` sont générés et exclus de Git.

Pour travailler séparément sur le backend et le frontend, consulter
[AGENTS.md](AGENTS.md).

## Production Kubernetes

- https://livefoot.online
- https://livefoot.tn

Après un push sur `main`, GitHub Actions construit les images, les publie
dans GitHub Container Registry (GHCR), puis déploie leurs versions exactes
dans K3s sur OVH. Le VPS télécharge les images ; il ne les construit plus.
Le workflow peut aussi être lancé depuis l'onglet **Actions** du dépôt.

Les quatre manifests YAML et les instructions de configuration GHCR sont dans
[k8s/README.md](k8s/README.md). Les clés API sont fournies par un Secret
Kubernetes et ne doivent pas être ajoutées au dépôt.

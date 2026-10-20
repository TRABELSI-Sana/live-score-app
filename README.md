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
dans GitHub Container Registry (GHCR), puis déploie les images `:latest`
dans K3s sur OVH. Le VPS télécharge les images ; il ne les construit plus.
Le workflow peut aussi être lancé depuis l'onglet **Actions** du dépôt.
La version dans `backend/pom.xml` définit le nom du JAR et un tag versionné des deux
images (par exemple `0.0.1`). Kubernetes utilise directement leurs noms complets
avec `:latest`. La production refuse les versions `SNAPSHOT`.

Les quatre manifests YAML et les instructions de configuration GHCR sont dans
[k8s/README.md](k8s/README.md). Les clés API sont fournies par un Secret
Kubernetes et ne doivent pas être ajoutées au dépôt.

## Déployer manuellement depuis le Mac

Prérequis : Java 21, Node.js 22, Docker avec Buildx, kubectl et le kubeconfig
OVH déjà configuré. Exécuter les commandes depuis la racine du dépôt.
Éviter de lancer simultanément un déploiement manuel et GitHub Actions.

### 1. Construire et vérifier les applications

```bash
cd backend
./mvnw clean package
JAR_NAME=$(./mvnw help:evaluate -Dexpression=project.build.finalName -q -DforceStdout -Dstyle.color=never)
cp "target/$JAR_NAME.jar" app.jar
cd ../frontend
npm ci
npx puppeteer browsers install chrome
npm run lint
npm run build:seo
cd ..
mkdir -p frontend-image/dist frontend-image/dist-tn
cp -R frontend/dist/. frontend-image/dist/
cp -R frontend/dist-tn/. frontend-image/dist-tn/
```

Le nom du JAR est lu dans le POM, sans version à remplacer dans ces commandes.

### 2. Publier les images dans GHCR

Se connecter avec un jeton GitHub ayant `write:packages`, à saisir à l'invite
Password. Le compte doit avoir accès aux packages du dépôt.

```bash
docker login ghcr.io -u TRABELSI-Sana
docker buildx build --platform linux/amd64 -t ghcr.io/trabelsi-sana/live-score-app/backend:latest --push backend
docker buildx build --platform linux/amd64 -t ghcr.io/trabelsi-sana/live-score-app/frontend:latest --push frontend-image
```

Ces commandes manuelles publient uniquement le tag `latest`.

### 3. Connecter kubectl au cluster OVH

Si le kubeconfig utilise `https://127.0.0.1:16443`, garder ce tunnel ouvert
dans un autre terminal :

```bash
ssh -N -L 127.0.0.1:16443:127.0.0.1:6443 ubuntu@51.210.246.121
```

Dans le terminal de déploiement, vérifier le contexte et le serveur avant
les commandes qui modifient le cluster :

```bash
export KUBECONFIG=~/.kube/ovh-k3s.yaml
kubectl config current-context
kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}'
kubectl get nodes
```

### 4. Déployer et vérifier

Sur le cluster déjà installé, les Deployments doivent utiliser les images
GHCR `:latest` avec `imagePullPolicy: Always` et le Secret `ghcr-credentials`.
Vérifier les références actuellement déployées :

```bash
kubectl -n live-score get deployment backend frontend -o wide
```

Si elles utilisent encore les anciens digests, lancer d'abord le workflow
GitHub Actions mis à jour pour appliquer les manifests et la politique de pull.
Ensuite, pour chaque publication manuelle :

```bash
kubectl -n live-score rollout restart deployment/backend deployment/frontend
kubectl -n live-score rollout status deployment/backend --timeout=300s
kubectl -n live-score rollout status deployment/frontend --timeout=300s
kubectl -n live-score get pods
curl -fsS https://livefoot.online/healthz
curl -fsS https://livefoot.tn/healthz
```

Le redémarrage crée de nouveaux pods qui récupèrent les images `latest`.
`kubectl apply` seul ne redémarre pas les pods si le YAML reste identique.
Les sites restent accessibles sur https://livefoot.online et https://livefoot.tn,
sans port dans l'URL.

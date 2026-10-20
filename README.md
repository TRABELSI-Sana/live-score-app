# LiveFoot

Scores de football en temps réel : backend Kotlin/Spring Boot, frontend
React/TypeScript, Redis, analyses de matchs et chatbot généraliste avec Ollama.

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

Deux modes de déploiement sont disponibles :

- **Automatique** : un push sur `main` lance les tests, construit et publie les
  images dans GHCR, puis applique les manifests sur K3s.
- **Manuel** : les commandes ci-dessous permettent de construire, publier,
  modifier le YAML et lancer `kubectl apply` séparément depuis le Mac.

Le registre utilisé est **GitHub Container Registry (GHCR)**. Les deux modes
utilisent la version du POM. Incrémenter cette version pour chaque nouvelle
release. La CI réutilise une image existante seulement si son empreinte de sources
correspond au code ; elle refuse de remplacer un tag publié avec un autre code.
Le tag `latest` reste un alias du dernier build, et les Deployments utilisent
les tags versionnés explicites.

Le script [deploy.py](deploy.py) prépare chaque étape séparément. La version du
POM définit le nom du JAR et les tags backend/frontend. Les images de production
utilisent une version explicite, par exemple `:0.0.2`.

## Déployer manuellement depuis le Mac

Prérequis : Python 3.9+, Java 21, Node.js 22, Docker avec Buildx, kubectl et le
kubeconfig OVH. Exécuter les commandes depuis la racine du dépôt.

### 0. Incrémenter la version

```bash
./deploy.py version patch
```

Par exemple, `0.0.1` devient `0.0.2` dans `backend/pom.xml`. Pour choisir une
version précise : `./deploy.py version 0.1.0`. Les versions `SNAPSHOT` sont refusées.

### 1. Créer l’application backend : JAR

```bash
./deploy.py jar
```

Exécute `cd backend && ./mvnw --batch-mode clean install`, avec les tests.
Le nom du JAR est lu dans Maven, par exemple `backend/target/live-scores-0.0.2.jar`.

### 2. Construire les images localement

```bash
./deploy.py image backend
./deploy.py image frontend
```

Le frontend est compilé et vérifié avant son image. Les deux images sont
construites pour `linux/amd64`, l’architecture du VPS. Cette étape ne publie rien.
Redis, Ollama et nginx utilisent des images officielles : aucune autre image
personnalisée n’est nécessaire actuellement. Pour mettre à jour une image
officielle, modifier son tag directement dans le YAML.

### 3. Publier les images dans le registre

Se connecter avec un jeton GitHub ayant `write:packages`, à saisir à l’invite
Password. Le compte doit avoir accès aux packages du dépôt.

```bash
docker login ghcr.io -u TRABELSI-Sana
./deploy.py push
```

Équivaut à deux commandes `docker push`, avec la version du POM :

```bash
docker push ghcr.io/trabelsi-sana/live-score-app/backend:0.0.2
docker push ghcr.io/trabelsi-sana/live-score-app/frontend:0.0.2
```

Le script refuse d’écraser une version déjà publiée. Après un échec partiel, on
peut relancer `./deploy.py push` : les images déjà publiées par cette préparation
sont conservées. Pour ne publier qu’une image construite : `./deploy.py push frontend`.

### 4. Modifier et vérifier le Deployment

```bash
./deploy.py manifests
git diff -- backend/pom.xml k8s/deployment.yaml
```

Cette commande inscrit les noms complets des images publiées directement dans
[k8s/deployment.yaml](k8s/deployment.yaml) :

```yaml
image: ghcr.io/trabelsi-sana/live-score-app/backend:0.0.2
# Dans le conteneur frontend :
image: ghcr.io/trabelsi-sana/live-score-app/frontend:0.0.2
```

Elle met aussi à jour la version des ConfigMaps dans les annotations pour que
leurs changements redémarrent les composants concernés. Le YAML est prêt pour
`kubectl apply`, sans substitution de variables. Tu peux l’ouvrir et le vérifier.

### 5. Appliquer depuis le terminal du Mac

```bash
export KUBECONFIG=~/.kube/ovh-k3s.yaml
kubectl config current-context
kubectl get nodes
kubectl apply -f k8s/
kubectl -n live-score rollout status deployment/backend --timeout=300s
kubectl -n live-score rollout status deployment/frontend --timeout=300s
kubectl -n live-score get pods
curl -fsS https://livefoot.online/healthz
curl -fsS https://livefoot.tn/healthz
```

Si le kubeconfig utilise `https://127.0.0.1:16443`, garder le tunnel suivant ouvert
dans un autre terminal avant les commandes kubectl :

```bash
ssh -N -L 127.0.0.1:16443:127.0.0.1:6443 ubuntu@51.210.246.121
```

Le changement de version dans le YAML déclenche le remplacement des pods avec
`kubectl apply`. Le script ne lance aucune commande kubectl automatiquement.

Après la release, committer `backend/pom.xml` et `k8s/deployment.yaml` avec le code
livré. À la release suivante, recommencer par l’incrément de version.
Les reçus de construction locaux dans `.release/` sont générés et ignorés par Git.
Le script détecte si le code ou le JAR a changé entre les étapes.

Les quatre manifests et les détails du cluster sont dans [k8s/README.md](k8s/README.md).
Docker Compose reste réservé au développement local.

## Espace assistant

La carte latérale propose trois vues indépendantes :

- **Briefing** : `GET /api/ai/briefing`, sélection immédiate des matchs depuis Redis.
- **Analyse IA** : `POST /api/ai/insights`, questions libres et suggestions sur les
  matchs, avec filtres (sélection, direct, à venir, terminés). Le flux SSE
  `/api/ai/insights/stream` reste disponible pour les clients existants.
- **Chat** : `POST /api/ai/chat`, assistant généraliste pour expliquer, rédiger,
  coder ou parler football. Les questions sur les matchs disposent du contexte
  LiveFoot et des horaires du fuseau du navigateur.

Le chat conserve l’historique dans `sessionStorage` pour l’onglet courant ;
« Nouvelle discussion » l’efface. Le serveur reçoit au plus six messages
précédents et limite le contexte transmis au modèle aux quatre derniers, avec
une longueur bornée. Le modèle ne navigue pas sur Internet et n’exécute pas de
commandes. Chat et analyses partagent une capacité de génération pour préserver
les ressources du VPS. Les appels de briefing n’utilisent pas Ollama et aucun de
ces endpoints ne déclenche de requête API-Football.

# Déploiement Kubernetes avec GHCR

Production : **https://livefoot.online** et **https://livefoot.tn**.

```text
Push sur main → tests / build → push des images GHCR → déploiement K3s
```

Le workflow est entièrement dans `.github/workflows/deploy.yml`.
Le job `build_push` construit et publie les images ; le job `deploy` applique
les manifests et attend que les pods soient prêts. Le VPS ne construit plus
les images, ne reçoit plus de JAR et n'importe plus d'archives Docker.

## Configurer GHCR une seule fois

GHCR fait partie de GitHub : il n'y a pas de serveur à installer. Les packages
sont créés au premier push d'image. Pour ce dépôt, les images seront :

- `ghcr.io/trabelsi-sana/live-score-app/backend:latest` ;
- `ghcr.io/trabelsi-sana/live-score-app/frontend:latest`.

Les manifests utilisent directement `:latest`. Le workflow publie aussi un tag
correspondant à `project.version` dans `backend/pom.xml`.
Le JAR suit également cette version : `live-scores-0.0.1.jar`.
Pour la release suivante, modifier la version du POM, par exemple `0.0.2`.
Le workflow de production refuse les versions `SNAPSHOT`.

La publication utilise le `GITHUB_TOKEN` automatiquement fourni par GitHub
Actions, avec la permission `packages: write`. Il n'est pas nécessaire de
créer un jeton personnel pour publier depuis ce workflow.

Pour que le VPS puisse télécharger les images privées après la fin du job :

1. Dans les paramètres de ton **compte GitHub**, ouvrir **Developer settings →
   Personal access tokens → Tokens (classic) → Generate new token (classic)**.
2. Sélectionner uniquement le scope **read:packages**, choisir une expiration
   et générer le jeton. Le compte doit avoir accès aux packages du dépôt.
3. Dans **le dépôt → Settings → Secrets and variables → Actions**, ajouter :
   - onglet **Secrets** : `GHCR_READ_TOKEN`, contenant le jeton de lecture ;
   - onglet **Variables** : `GHCR_USERNAME`, contenant le nom du compte
     propriétaire du jeton si ce compte diffère du propriétaire du dépôt.
     Par défaut, le workflow utilise le propriétaire du dépôt.
4. Conserver les secrets SSH utilisés pour le VPS : `VPS_SSH_KEY` et
   `VPS_HOST_KEY`.
5. Committer les changements et pousser sur `main`. Ouvrir l'onglet **Actions**.
   Les deux packages apparaîtront après la première publication.

Le workflow installe les identifiants de lecture dans le Secret Kubernetes
`ghcr-credentials`. Les pods backend et frontend l'utilisent avec
`imagePullSecrets`. Renouveler `GHCR_READ_TOKEN` avant son expiration, puis
relancer le workflow pour mettre le Secret Kubernetes à jour.
Le jeton GitHub du job n'est pas utilisé comme identifiant permanent du cluster.

## Quatre manifests

| Fichier | Contenu |
| --- | --- |
| `deployment.yaml` | backend, frontend, edge nginx, Redis, Ollama |
| `service.yaml` | adresses réseau internes des composants |
| `configmap.yaml` | namespace, configuration applicative et nginx |
| `pvc.yaml` | stockage persistant Redis et Ollama |

Le workflow remplace uniquement `${CONFIG_VERSION}`. Les noms complets des images
avec `:latest` sont écrits dans `deployment.yaml`, avec `imagePullPolicy: Always`.
Après application, le workflow redémarre backend et frontend pour récupérer les
images fraîchement publiées, même si le YAML n'a pas changé.
La version de configuration redémarre les composants concernés si leur ConfigMap
change. Ollama utilise une image officielle épinglée par digest ; les modèles
existants restent dans son PVC.

La clé API-Football reste dans le Secret existant `api-football`, champ
`APIFOOTBALL_KEY`. Elle n'est ni dans les images ni dans les manifests.
Le polling est actif, avec une limite de 7500 appels/jour et un seul backend.

## Vérifier et revenir à une version précédente

Dans OpenLens, sélectionner le namespace **live-score**, ou sur le VPS :

```bash
sudo k3s kubectl -n live-score get pods,services,pvc
sudo k3s kubectl -n live-score logs deployment/backend --tail=50
```

Pour revenir à une version publiée précédente, indiquer son tag :

```bash
sudo k3s kubectl -n live-score set image deployment/backend backend=ghcr.io/trabelsi-sana/live-score-app/backend:0.0.1
sudo k3s kubectl -n live-score rollout status deployment/backend
```

Les PVC `local-path` sont attachés à cet unique VPS. Les sauvegardes de bascule
restent dans `/home/ubuntu/apps/live-score-k8s/backups/` sur le serveur.

## HTTPS

Le pod `edge` utilise directement les ports 80/443 du VPS. Certbot renouvelle
le certificat existant pour les deux domaines et leurs variantes `www`.
Conserver `/etc/letsencrypt` et le répertoire ACME
`/home/ubuntu/apps/live-scores/certbot/www` sur le VPS.
Le hook `ops/reload-nginx-after-cert-renewal.sh` recharge nginx après renouvellement.

## Briefing et analyse IA

`GET /api/ai/briefing` renvoie immédiatement une sélection structurée des matchs :
rencontres serrées en fin de match, prochains coups d’envoi et résultats riches en
buts. Les équipes, scores et compétitions proviennent directement des données du
board Redis. Cet endpoint ne déclenche ni appel Ollama ni appel API-Football.
Le frontend actualise cette sélection toutes les 60 secondes et propose un
éclairage IA à la demande lorsqu’au moins une rencontre sélectionnée possède un
score en cours ou terminé. Avant les matchs, seuls le programme et les horaires
sont affichés. L’analyse est limitée aux rencontres de l’onglet choisi.

### Génération sur CPU

Le backend utilise `qwen2.5:3b`, avec un contexte de 2048 tokens, au plus
160 tokens générés et un maintien du modèle en mémoire de 30 minutes.
Le prompt demande trois points courts, en français, fondés sur les scores fournis.
La limite d'attente est de 25 secondes, inférieure aux 30 secondes du flux SSE.

Avant un premier déploiement sur un nouveau volume Ollama :

```bash
sudo k3s kubectl -n live-score exec deployment/ollama -- ollama pull qwen2.5:3b
```

Le backend conserve jusqu'à 64 résumés réussis pendant 60 secondes. Un changement
au contexte des matchs ou à la question provoque une nouvelle génération.
Les requêtes identiques simultanées partagent la même génération ; une question
différente reçoit `busy` lorsque le modèle est occupé. Un timeout client ne libère
pas prématurément la capacité du modèle et ne déclenche pas une file de calculs.

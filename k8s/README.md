# Déploiement Kubernetes avec GHCR

Production : **https://livefoot.online** et **https://livefoot.tn**.

Le déploiement manuel suit les commandes du [README principal](../README.md) :

```text
Version POM → clean install → images locales → push GHCR → Deployment versionné → kubectl apply
```

Le script `../deploy.py` prépare chaque étape séparément. Il ne lance jamais
kubectl. Le déploiement automatique au push sur `main` reste actif dans
`.github/workflows/deploy.yml` : tests, publication GHCR et application sur K3s.
La CI prépare ses manifests avec la même version du POM et réutilise uniquement
les images publiées dont l’empreinte correspond au code. Un tag de release déjà
publié avec un autre code impose un incrément de version.

Les secrets GitHub existants `VPS_SSH_KEY`, `VPS_HOST_KEY`, `GHCR_READ_TOKEN`
et, si nécessaire, la variable `GHCR_USERNAME` restent utilisés pour le déploiement
automatique. Le `GITHUB_TOKEN` publie les images avec `packages: write`.

## Registre GHCR

Les deux images applicatives utilisent des tags explicites issus du POM :

- `ghcr.io/trabelsi-sana/live-score-app/backend:0.0.2` ;
- `ghcr.io/trabelsi-sana/live-score-app/frontend:0.0.2`.

`0.0.2` illustre un tag de release. Le script lit la version courante
et refuse de republier un tag existant. Se connecter depuis le Mac avec
`docker login ghcr.io -u TRABELSI-Sana`, avec un jeton ayant `write:packages`.

Le cluster existant dispose du Secret `ghcr-credentials` pour télécharger les
images privées et du Secret `api-football` pour la clé fournisseur. Les conserver.
Ils ne sont pas stockés dans les manifests ni recréés par le script de release.
Le jeton de lecture du registre doit conserver l’accès aux packages privés ;
renouveler ce Secret sur le cluster avant l’expiration de son jeton.

## Quatre manifests

| Fichier | Contenu |
| --- | --- |
| `deployment.yaml` | backend, frontend, edge nginx, Redis, Ollama |
| `service.yaml` | adresses réseau internes des composants |
| `configmap.yaml` | namespace, configuration applicative et nginx |
| `pvc.yaml` | stockage persistant Redis et Ollama |

`./deploy.py manifests` met les noms complets des images versionnées dans
`deployment.yaml` et actualise l’annotation de configuration à partir de
`configmap.yaml`. Il ne reste aucune variable à remplacer avant l’application.
Le passage à une nouvelle version déclenche le rollout avec `kubectl apply`.
Une modification de ConfigMap déclenche également le redémarrage des composants
concernés quand les annotations sont mises à jour.
Ollama utilise une image officielle épinglée par digest ; ses modèles restent dans
son PVC. Redis et nginx utilisent aussi des images officielles.

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
éclairage IA à la demande dans l’onglet Analyse IA, accessible également avant
les matchs via `POST /api/ai/insights`. L’utilisateur peut choisir le périmètre
des rencontres et saisir sa question. L’onglet Chat utilise `POST /api/ai/chat`
pour les conversations généralistes avec historique et contexte LiveFoot.

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

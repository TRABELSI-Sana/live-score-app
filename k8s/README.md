# Déploiement Kubernetes avec Docker Hub

Production : **https://livefoot.online** et **https://livefoot.tn**.

Le déploiement manuel suit les commandes du [README principal](../README.md) :

```text
Version POM → clean install → images locales → push Docker Hub → Deployment versionné → kubectl apply
```

Le script `../deploy.py` prépare chaque étape séparément. Il ne lance jamais
kubectl. Le déploiement automatique au push sur `main` reste actif dans
`.github/workflows/deploy.yml` : tests, publication Docker Hub et application sur K3s.
La CI prépare ses manifests avec la même version du POM et réutilise uniquement
les images publiées dont l’empreinte correspond au code. Un tag de release déjà
publié avec un autre code impose un incrément de version.

Les secrets GitHub `VPS_SSH_KEY` et `VPS_HOST_KEY` restent utilisés. Ajouter
`DOCKERHUB_USERNAME` (`trabelsislim`) et `DOCKERHUB_TOKEN` (jeton avec accès
en écriture) pour la publication automatique.

## Registre Docker Hub

Les deux images applicatives utilisent des tags explicites issus du POM :

- `docker.io/trabelsislim/live-score-backend:0.0.2` ;
- `docker.io/trabelsislim/live-score-frontend:0.0.2`.

`0.0.2` illustre un tag de release. Le script lit la version courante
et refuse de republier un tag existant. Se connecter depuis le Mac avec
`docker login -u trabelsislim`, avec un jeton Docker Hub ayant accès en écriture.

Les images Docker Hub sont publiques : aucun Secret de registre n’est nécessaire.
La génération des manifests retire la référence à `ghcr-credentials`. Conserver
le Secret `api-football` pour la clé fournisseur.

## Cinq manifests

| Fichier | Contenu |
| --- | --- |
| `deployment.yaml` | backend, frontend, edge nginx, Redis, Ollama |
| `service.yaml` | adresses réseau internes des composants |
| `configmap.yaml` | namespace, configuration applicative et nginx |
| `pvc.yaml` | stockage persistant Redis et Ollama |
| `cronjob.yaml` | nettoyage quotidien des données de matchs |

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
sudo k3s kubectl -n live-score set image deployment/backend backend=docker.io/trabelsislim/live-score-backend:0.0.1
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

## Nettoyage quotidien en CronJob

`cronjob.yaml` déplace le nettoyage de 03 h du backend vers le CronJob
`match-cache-cleanup`. L'horaire explicite est **03 h UTC** (05 h à Paris en été,
04 h en hiver). Le polling des matchs reste exécuté dans le backend.

Le quota API-Football n'a pas besoin de reset : il utilise une clé par jour UTC.
L'ancien `FLUSHDB` est remplacé par la suppression ciblée de `match:state:*`,
`livescores:board-keys` et `matches:live`. Les compteurs `apifootball:quota:*`
et les autres caches sont conservés. Les pollers repeuplent ensuite les matchs ;
le tableau peut être temporairement vide, comme après l'ancien reset.

Le CronJob utilise directement l'image officielle Redis et `redis-cli` : aucun
JAR dédié, aucune nouvelle image à construire, aucun appel API fournisseur.
Il interdit les exécutions simultanées, ne réessaie pas automatiquement et conserve
les Jobs/logs pendant sept jours au maximum (trois succès et trois échecs).

Pour une future mise en service, incrémenter d'abord la version et publier le
backend qui retire l'ancien `@Scheduled`. Attendre son rollout avant d'appliquer
`cronjob.yaml`, afin d'éviter l'ancien reset et le nouveau nettoyage en parallèle.
Le workflow automatique respecte cet ordre. Pour un déploiement manuel lors de
cette migration, appliquer les autres manifests, attendre le rollout du backend,
puis appliquer le CronJob séparément.

Après déploiement, consulter **OpenLens → Workloads → CronJobs**. Les exécutions
apparaissent dans **Jobs**, avec leurs pods et leurs logs. Un CronJob ne crée pas
un Job immédiatement : le premier démarrera au prochain horaire prévu.

La modification locale des fichiers seule ne crée aucun Job sur le cluster :
le CronJob doit être appliqué après le rollout du backend.

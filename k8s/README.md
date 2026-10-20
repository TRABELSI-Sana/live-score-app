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

- `ghcr.io/trabelsi-sana/live-score-app/backend:<commit>` ;
- `ghcr.io/trabelsi-sana/live-score-app/frontend:<commit>`.

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

Le workflow remplace uniquement `${BACKEND_IMAGE}`, `${FRONTEND_IMAGE}` et
`${CONFIG_VERSION}`. Les images sont étiquetées avec le commit et déployées
par leur digest exact. La version de configuration redémarre les composants
concernés si leur ConfigMap change. Ollama utilise une image officielle
épinglée par digest ; les modèles existants restent dans son PVC.

La clé API-Football reste dans le Secret existant `api-football`, champ
`APIFOOTBALL_KEY`. Elle n'est ni dans les images ni dans les manifests.
Le polling est actif, avec une limite de 7500 appels/jour et un seul backend.

## Vérifier et revenir à une version précédente

Dans OpenLens, sélectionner le namespace **live-score**, ou sur le VPS :

```bash
sudo k3s kubectl -n live-score get pods,services,pvc
sudo k3s kubectl -n live-score logs deployment/backend --tail=50
```

Pour revenir au Deployment précédent d'un composant :

```bash
sudo k3s kubectl -n live-score rollout undo deployment/backend
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

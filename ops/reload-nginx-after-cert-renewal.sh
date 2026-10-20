#!/usr/bin/env bash
set -euo pipefail

KUBECTL=(/usr/local/bin/k3s kubectl -n live-score)
"${KUBECTL[@]}" exec deployment/edge -- nginx -t
"${KUBECTL[@]}" exec deployment/edge -- nginx -s reload
# Headlamp uses the same certificate, independently of the application.
if docker inspect headlamp-https >/dev/null 2>&1; then
  docker exec headlamp-https nginx -t
  docker exec headlamp-https nginx -s reload
fi

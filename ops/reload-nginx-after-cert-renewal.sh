#!/usr/bin/env bash
set -euo pipefail

cd /home/ubuntu/apps/live-scores
docker compose exec -T web nginx -t
docker compose exec -T web nginx -s reload

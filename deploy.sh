#!/usr/bin/env bash
set -euo pipefail

VPS_USER="ubuntu"
VPS_HOST="51.210.246.121"
REMOTE_DIR="/home/${VPS_USER}/apps/live-scores"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
JAR_GLOB="${BACKEND_DIR}/target/*-SNAPSHOT.jar"

echo "==> 1) Build backend"
pushd "${BACKEND_DIR}" >/dev/null
chmod +x mvnw
./mvnw -DskipTests clean package
popd >/dev/null

JAR_PATH="$(ls -1 ${JAR_GLOB} 2>/dev/null | head -n 1 || true)"
if [[ -z "${JAR_PATH}" || ! -f "${JAR_PATH}" ]]; then
  echo "❌ Jar not found. Looked for: ${JAR_GLOB}"
  ls -la "${BACKEND_DIR}/target" || true
  exit 1
fi
echo "✅ Using jar: ${JAR_PATH}"

echo "==> 2) Build frontend"
pushd "${FRONTEND_DIR}" >/dev/null
npm ci
npm run build
popd >/dev/null

echo "==> 3) Prepare frontend-image/dist (local)"
rm -rf frontend-image/dist
mkdir -p frontend-image/dist
rsync -a --delete "${FRONTEND_DIR}/dist/" frontend-image/dist/

echo "==> 4) Prepare folders on VPS"
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${REMOTE_DIR}/{backend,frontend-image,nginx,certbot/www,certbot/conf}"

echo "==> 5) Upload backend (jar + Dockerfile)"
rsync -av "${JAR_PATH}" ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/backend/app.jar
rsync -av ${BACKEND_DIR}/Dockerfile ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/backend/

echo "==> 6) Upload frontend-image (Dockerfile + dist)"
rsync -av --delete frontend-image/ ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/frontend-image/

echo "==> 7) Upload infra files (compose + nginx)"
rsync -av docker-compose.yml ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/
rsync -av nginx/ ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/nginx/

echo "==> 8) Deploy (build & restart)"
ssh ${VPS_USER}@${VPS_HOST} "cd ${REMOTE_DIR} && docker compose up -d --build"

echo "✅ Deploy OK"

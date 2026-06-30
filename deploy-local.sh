#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
JAR_GLOB="${BACKEND_DIR}/target/*-SNAPSHOT.jar"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_DEPLOY_DIR="${PROJECT_ROOT}/.local-deploy"

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

echo "==> 4) Prepare local deploy folder"
rm -rf "${LOCAL_DEPLOY_DIR}"
mkdir -p "${LOCAL_DEPLOY_DIR}/backend" "${LOCAL_DEPLOY_DIR}/frontend-image" "${LOCAL_DEPLOY_DIR}/nginx"

# backend
cp -f "${JAR_PATH}" "${LOCAL_DEPLOY_DIR}/backend/app.jar"
cp -f "${BACKEND_DIR}/Dockerfile" "${LOCAL_DEPLOY_DIR}/backend/"

# frontend-image (Dockerfile + dist)
rsync -a --delete "frontend-image/" "${LOCAL_DEPLOY_DIR}/frontend-image/"

# infra (compose + nginx)
cp -f "docker-compose-local.yml" "${LOCAL_DEPLOY_DIR}/docker-compose.yml"
cp -f "nginx/default-local.conf" "${LOCAL_DEPLOY_DIR}/nginx/default.conf"

echo "==> 5) Deploy locally (build & restart)"
cd "${LOCAL_DEPLOY_DIR}"
docker compose up -d --build

echo "✅ Local deploy OK"

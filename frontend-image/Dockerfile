FROM nginx:alpine

RUN apk add --no-cache curl

COPY dist/browser/ /usr/share/nginx/html-online/
COPY dist-tn/browser/ /usr/share/nginx/html-tn/

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -sf http://localhost:80/ || exit 1

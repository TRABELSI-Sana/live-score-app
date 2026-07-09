FROM nginx:alpine

RUN apk add --no-cache curl

COPY dist/ /usr/share/nginx/html-online/
COPY dist-tn/ /usr/share/nginx/html-tn/

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -sf http://localhost:80/ || exit 1

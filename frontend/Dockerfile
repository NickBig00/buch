# syntax=docker/dockerfile:1

# Frontend SPA (Angular) als statische Files via Nginx.
# HTTPS wird über gemountete Zertifikate bereitgestellt (./frontend/.cert).

FROM node:20-alpine AS build

WORKDIR /app

# pnpm via corepack
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN corepack prepare pnpm@10.20.0 --activate \
  && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache openssl \
  && mkdir -p /certs \
  && openssl req -x509 -nodes -days 3650 \
    -newkey rsa:2048 \
    -keyout /certs/localhost-key.pem \
    -out /certs/localhost.pem \
    -subj "/CN=localhost" \
  && apk del openssl

# Nginx-Template (envsubst durch offizielles nginx entrypoint)
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Angular Build Output: bei @angular/build:application typischerweise dist/<project>/browser
# Wir kopieren beide üblichen Varianten robust.
COPY --from=build /app/dist /tmp/dist
RUN set -eux; \
  if [ -d "/tmp/dist/frontend/browser" ]; then \
    cp -R /tmp/dist/frontend/browser/* /usr/share/nginx/html/; \
  elif [ -d "/tmp/dist/frontend" ]; then \
    cp -R /tmp/dist/frontend/* /usr/share/nginx/html/; \
  else \
    # Fallback: alles
    cp -R /tmp/dist/* /usr/share/nginx/html/; \
  fi; \
  rm -rf /tmp/dist

# Standard: Backend lokal (Docker Desktop) erreichbar.
ENV API_TARGET="https://host.docker.internal:3000"

EXPOSE 443

# nginx image entrypoint startet nginx

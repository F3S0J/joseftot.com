# Static build, served by Caddy. On Cloudflare Pages only the build stage matters (output: dist/).
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM caddy:2-alpine
# unprivileged server; the files it serves are owned by root and read-only
ENV XDG_CONFIG_HOME=/tmp/caddy XDG_DATA_HOME=/tmp/caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
RUN chmod -R a-w /srv /etc/caddy
USER nobody
EXPOSE 8080

# syntax=docker/dockerfile:1.7

FROM node:22.17.0-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM node:22.17.0-slim AS builder
WORKDIR /app
ENV CI=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm run build:server

FROM node:22.17.0-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

FROM node:22.17.0-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=8080 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_CACHE_DIR=/tmp

RUN mkdir -p /tmp/next && chown -R 1001:1001 /tmp/next

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 --ingroup nodejs nodeuser

COPY --from=prod-deps /app/node_modules     ./node_modules
COPY --from=builder   /app/.next            ./.next
COPY --chown=1001:1001 --from=builder /app/.next ./.next
COPY --from=builder   /app/public           ./public
COPY --from=builder   /app/next.config.*    ./
COPY --from=builder   /app/package*.json    ./
COPY --from=builder   /app/dist/server.js   ./server.cjs

USER 1001
EXPOSE 8080
CMD ["node", "server.cjs"]

# syntax=docker/dockerfile:1

# ---- Base
FROM node:24-alpine AS base
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /app

# ---- Install all deps (dev included) for compilation
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Compile TypeScript -> dist/
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Production-only dependencies
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Final runtime image
FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --chown=app:app package.json ./

USER app
EXPOSE 4000
CMD ["node", "dist/server.js"]
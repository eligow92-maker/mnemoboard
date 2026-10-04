# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache ca-certificates openssl

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --ignore-scripts

FROM node:22-alpine AS dev
WORKDIR /app

RUN apk add --no-cache ca-certificates openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run dev"]

FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache ca-certificates openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Wartości zastępcze tylko na czas budowania — prawdziwe pochodzą ze środowiska.
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npm run build

# Seed listy GSP jako jeden plik JS: w produkcji nie ma tsx ani katalogu src.
RUN npx esbuild prisma/seed.ts --bundle --platform=node --target=node22 \
      --external:@prisma/client --outfile=prisma/seed.js

RUN npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache ca-certificates openssl

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/prisma ./prisma

# Tryb standalone ma własny, wyśledzony node_modules (w tym klient Prisma). CLI Prisma do
# migracji przy starcie jest w devDependencies i znika po `npm prune`, więc instalujemy je
# osobno, w /opt/prisma-cli (instalacja w /app dociągnęłaby całe next i narzędzia deweloperskie),
# razem z silnikami — dzięki temu start kontenera nie wymaga internetu.
COPY --from=builder /app/package.json /tmp/app-package.json
RUN mkdir /opt/prisma-cli && cd /opt/prisma-cli \
    && npm init -y >/dev/null \
    && npm install --no-audit --no-fund \
      "prisma@$(node -p "require('/tmp/app-package.json').devDependencies.prisma")" \
    && npm cache clean --force && rm /tmp/app-package.json

USER node

EXPOSE 3000

# Odpowiada 200 tylko wtedy, gdy działa połączenie z bazą (/api/health sprawdza bazę).
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["sh", "-c", "/opt/prisma-cli/node_modules/.bin/prisma migrate deploy && node prisma/seed.js && node server.js"]

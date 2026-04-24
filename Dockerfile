# ─────────────────────────────────────────────
# Étape 1 : build TypeScript → JavaScript
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

# Installer OpenSSL (requis par Prisma)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les manifestes en premier pour profiter du cache Docker
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Installer TOUTES les dépendances (dev inclus pour tsc + prisma generate)
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source et compiler
COPY src ./src/
RUN npm run build

# ─────────────────────────────────────────────
# Étape 2 : image de production (légère)
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS production

# Installer OpenSSL dans l'image finale aussi
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les manifestes et le schema Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Générer le client Prisma dans l'image de production
RUN npx prisma generate

# Copier le code compilé depuis le builder
COPY --from=builder /app/dist ./dist/

EXPOSE 3000

# Appliquer les migrations puis démarrer
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
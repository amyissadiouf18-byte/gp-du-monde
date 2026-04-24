# ─────────────────────────────────────────────
# BUILD
# ─────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm ci

# IMPORTANT
RUN apt-get update -y && apt-get install -y openssl
RUN npx prisma generate

COPY src ./src/

RUN npm run build


# ─────────────────────────────────────────────
# PRODUCTION
# ─────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

# IMPORTANT
RUN npx prisma generate

COPY --from=builder /app/dist ./dist/

USER appuser

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
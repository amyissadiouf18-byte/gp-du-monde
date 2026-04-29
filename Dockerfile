# ─────────────────────────────────────────────
# Stage 1 — Dependencies (single npm ci)
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# One install for everything — builder reuses this layer
RUN npm ci && \
    npx prisma generate


# ─────────────────────────────────────────────
# Stage 2 — Build
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Reuse deps — no second npm ci
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma       ./prisma

COPY . .

RUN npm run build && \
    npm prune --omit=dev
RUN apk add --no-cache openssl

# ─────────────────────────────────────────────
# Stage 3 — Production image
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Non-root user — security best practice
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nestjs

# Copy only what the app needs at runtime
COPY --from=builder --chown=nestjs:nodejs /app/node_modules   ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist           ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma         ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package.json   ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma.config.ts ./prisma.config.ts

USER nestjs

EXPOSE 3000

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma.config.ts && node dist/main.js"]
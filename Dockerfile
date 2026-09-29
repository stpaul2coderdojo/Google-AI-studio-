# Multi-stage Dockerfile for Wilderness Dojo Antigravity Billing AI
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build Vite frontend and bundle Express server.ts into dist/server.cjs
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled frontend and bundled server from builder stage
COPY --from=builder /app/dist ./dist

# Non-root user for security
USER node

# Expose standard application port
EXPOSE 3000

# Health check to ensure service readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]

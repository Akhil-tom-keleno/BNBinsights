# Stage 1: Build
FROM node:20-alpine AS builder

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ gcc

WORKDIR /app

# Copy package files
COPY package*.json ./

# Improve npm network resilience
ENV npm_config_fetch_retries=5 \
  npm_config_fetch_retry_mintimeout=20000 \
  npm_config_fetch_retry_maxtimeout=120000 \
  npm_config_registry=https://registry.npmjs.org/

# Install all dependencies (including devDependencies for build)
RUN npm ci --no-audit --prefer-offline

# Copy source code
COPY . .

# Build the application (TypeScript + Vite)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ gcc

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --no-audit --prefer-offline

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server source (runs with tsx in production or compiled)
COPY --from=builder /app/server ./server

# Copy tsconfig for tsx runtime
COPY --from=builder /app/tsconfig*.json ./

# Create database directory with proper permissions
RUN mkdir -p /app/server/database && chown -R node:node /app/server/database

# Create a non-root user for security
USER node

# Expose the application port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the server
CMD ["npx", "tsx", "server/index.ts"]

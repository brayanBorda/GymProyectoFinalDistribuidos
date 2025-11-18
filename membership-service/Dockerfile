# Build stage
FROM node:18-bullseye AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \ 
    && rm -rf /var/lib/apt/lists/* \
    && npm ci

# Copy source code
COPY src/ ./src/
# The Prisma schema in this repo lives under src/infrastructure/database/prisma
COPY src/infrastructure/database/prisma ./prisma/

# Generate Prisma client (point to the copied schema path)
RUN npx prisma generate --schema=prisma/schema.prisma

# Build the application
RUN npm run build

# Production stage
FROM node:18-bullseye AS production

# Install dumb-init and OpenSSL for Prisma runtime compatibility
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init openssl ca-certificates \ 
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 nodejs || true && useradd -u 1001 -r -g nodejs nodejs || true

# Set working directory
WORKDIR /app

# Copy built application and dependencies
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3002

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "migrate:init"]
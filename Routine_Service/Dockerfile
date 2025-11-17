FROM node:18-alpine AS builder
WORKDIR /app

# Copy package manifests and install all deps (including dev) in the builder
COPY package*.json ./
RUN npm ci

# install netcat for scripts during build
RUN apk add --no-cache netcat-openbsd

# copy source and build
COPY . .
RUN chmod +x ./scripts/wait-for-postgres.sh || true
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

# runtime helpers and dos2unix to normalize line endings
RUN apk add --no-cache dos2unix dumb-init netcat-openbsd

# install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# copy built artifacts and runtime scripts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
RUN dos2unix ./scripts/wait-for-postgres.sh || true && chmod +x ./scripts/wait-for-postgres.sh || true

EXPOSE 4002
# wait for postgres then start app
CMD ["sh", "-c", "./scripts/wait-for-postgres.sh postgres 5432 && node dist/index.js"]

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production && \
    cd backend && npm ci

# Copy source
COPY backend ./backend

# Generate Prisma client and build
WORKDIR /app/backend
RUN npx prisma generate && \
    npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]

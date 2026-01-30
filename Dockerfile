# Dockerfile for Next.js application - Optimized for faster builds

# 1. Builder Stage: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies needed for build
RUN apk add --no-cache libc6-compat

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install all dependencies with frozen lockfile for faster, deterministic builds
# Use BuildKit cache mount to cache npm packages between builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --progress=false

# Copy source code (this layer changes most often)
COPY . .

# Disable Next.js telemetry and optimize build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true

# Build the Next.js application
# Re-use Next.js incremental cache between builds to avoid recompiling unchanged pages
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# 2. Runner Stage: Create the final, minimal image
FROM node:20-alpine AS runner
WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache dumb-init libc6-compat && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy the standalone output from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the static assets from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the public folder from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Start the server with dumb-init for better signal handling
CMD ["dumb-init", "node", "server.js"]

# Dockerfile for Next.js application

# 1. Installer Stage: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dumb-init for better signal handling
RUN apk add --no-cache dumb-init

# Copy package.json and lock file
COPY package.json package-lock.json* ./

# Install dependencies with optimizations
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# 2. Builder Stage: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including devDependencies) for build
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Disable Next.js telemetry and optimize build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application with optimizations
RUN npm run build && \
    npm prune --production && \
    npm cache clean --force

# 3. Runner Stage: Create the final, small image
FROM node:20-alpine AS runner
WORKDIR /app

# Install dumb-init for better signal handling
RUN apk add --no-cache dumb-init

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

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

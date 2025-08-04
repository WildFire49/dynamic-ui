# Dockerfile for Next.js application

# 1. Installer Stage: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and lock file
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# 2. Builder Stage: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

# 3. Runner Stage: Create the final, small image
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./

# Copy the static assets from the builder stage
COPY --from=builder /app/.next/static ./.next/static

# Copy the public folder from the builder stage
COPY --from=builder /app/public ./public

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the port environment variable
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]

# Stage 1
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base as deps
WORKDIR /app

# Install required packages for building native dependencies
RUN apk add --no-cache libc6-compat g++ make python3
COPY package.json package-lock.json* ./
RUN npm ci

# Build the project
FROM base as builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app
RUN apk update && apk add --no-cache gettext grep bash

ENV NODE_ENV=production

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# Copy the compiled code and node_modules from the build stage
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=appuser:nodejs /app/entrypoint.sh ./


# Remove the production environment template and adjust ownership
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3001

# Set the port environment variable
ENV APP_PORT 3001

# Define the entry point script
ENTRYPOINT ["./entrypoint.sh"]
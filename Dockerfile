# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies like TypeScript)
RUN npm ci

# Declare build arguments (injected by GitHub Actions at build-time)
ARG VITE_API_URL
ARG PUBLIC_URL_API
ARG VITE_SITE_VIEWER_URL

# Expose these variables to the build process (Vite bakes them into JS)
ENV VITE_API_URL=$VITE_API_URL
ENV PUBLIC_URL_API=$PUBLIC_URL_API
ENV VITE_SITE_VIEWER_URL=$VITE_SITE_VIEWER_URL

# Copy source code
COPY . .

# Run the build command
RUN npm run build

# Stage 2: Production runtime stage
FROM node:22-alpine

# Set node environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built assets and vite configuration from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/vite.config.ts ./

# Expose port 3001
EXPOSE 3001

# Start the built-in Vite preview server bound to all interfaces
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3001"]

# ===================================================
# Stage 1: Build Frontend (Node 20 Alpine)
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (use npm install to ensure all deps are resolved)
RUN npm install

# Copy source code and build production assets
COPY . .
RUN npm run build

# ===================================================
# Stage 2: Production Web Server (Nginx Alpine)
# ===================================================
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

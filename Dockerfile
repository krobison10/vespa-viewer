# Multi-service Dockerfile with Nginx reverse proxy
FROM node:20-alpine AS base

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Set working directory
WORKDIR /app

# Install and build Web app
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Install API dependencies
WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci --only=production

# Copy API source
WORKDIR /app/api
COPY api/ ./

# Copy SQL migrations
COPY sql/ /app/sql/

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /etc/nginx/ssl 2>/dev/null || true

# Create supervisor configuration
RUN mkdir -p /etc/supervisor.d
COPY supervisord.conf /etc/supervisord.conf

# Create nginx directories and set permissions
RUN mkdir -p /var/lib/nginx/tmp /var/log/nginx /run/nginx && \
    chown -R nginx:nginx /var/lib/nginx /var/log/nginx /run/nginx && \
    chmod -R 755 /var/lib/nginx /var/log/nginx /run/nginx

# Expose port
EXPOSE 80

# Start supervisor to manage all services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

# Stage 1: Build the application
FROM node:22-alpine AS build
WORKDIR /app

# Copy package configuration and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine AS final

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add a basic Nginx configuration for single-page applications
# This ensures that all routes are redirected to index.html
RUN echo "server { listen 80; server_name localhost; root /usr/share/nginx/html; index index.html; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
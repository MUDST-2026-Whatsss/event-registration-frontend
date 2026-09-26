# Stage 1: Build the Vue application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package manifests first for optimal layer caching
COPY package.json package-lock.json ./

# Install dependencies using clean install
RUN npm ci

# Copy project files
COPY . .

# Build the production bundle into dist/
RUN npm run build

# Stage 2: Serve the production assets with Nginx
FROM nginx:alpine AS production

# Copy custom Nginx configuration supporting SPA routing (Vue Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the builder stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

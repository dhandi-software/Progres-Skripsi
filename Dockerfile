# =========================
# Build stage
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


# =========================
# Runtime stage
# =========================
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including @react-router/serve)
RUN npm ci

# Copy built app from builder stage  
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# Set environment variables
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Start the React Router server
CMD ["npx", "react-router-serve", "./build/server/index.js"]

# Stage 1: Build del frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + archivos estáticos
FROM node:18-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000

CMD ["node", "src/app.js"]

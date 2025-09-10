# Production Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

EXPOSE 4000

CMD ["npm", "start"]

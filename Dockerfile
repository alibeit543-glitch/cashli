FROM node:20-slim

WORKDIR /app

# Install system dependencies required by mongodb-memory-server
RUN apt-get update && apt-get install -y libcurl4 && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install

# Build frontend
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy backend source
COPY backend/ ./backend/
COPY railway.json ./

# Serve frontend build from backend
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD node backend/server.js

# Use multi-stage build

# Stage 1: Build the frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build the backend and serve the app
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p /app/backend /app/static

# Copy backend source
COPY backend/app /app/backend/app
COPY backend/tts_server.py /app/backend/tts_server.py

# Copy frontend build to static directory
COPY --from=build-frontend /app/frontend/dist /app/static

# Set environment variables
ENV PYTHONPATH="/app/backend"
ENV HOST="0.0.0.0"
ENV PORT=8080

EXPOSE 8080

# Command to run the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]

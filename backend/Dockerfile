# Use official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir certifi

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Run the application
CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8080}

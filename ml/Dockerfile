# ============================================================
# Dockerfile — FastAPI ML Recommendation Service
# ============================================================

FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY serve_model.py .

# Create directories for models and data
RUN mkdir -p models data logs

# Copy pre-trained model (must be trained before building)
COPY models/ ./models/

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["uvicorn", "serve_model:app", "--host", "0.0.0.0", "--port", "5000", "--workers", "2"]

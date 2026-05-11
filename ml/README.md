# Orientus ML — Recommendation Service

AI-powered university program recommendation engine using XGBoost.

## Overview

This service exposes a REST API (FastAPI) that takes a student profile + list of programs and returns a ranked list of matched programs with a match score (0–100%).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/predict` | Get program recommendations |
| `GET` | `/docs` | Swagger UI (auto-generated) |

## Setup — Local Development

### Prerequisites
- Python 3.10
- pip or conda

### Install dependencies
```bash
pip install -r requirements.txt
# or with conda:
conda env create -f environment.yml
conda activate orientus-ml
```

### Train the model (required before first run)
```bash
python train_model.py
# This generates: models/orientus_recommender_v1.pkl
#                 models/label_encoders.pkl
```

### Run the service
```bash
uvicorn serve_model:app --host 0.0.0.0 --port 5000 --reload
```

## Setup — Docker

```bash
# From the ml/ directory:
docker build -t orientus-ml .
docker run -p 5000:5000 -v $(pwd)/models:/app/models orientus-ml
```

## Example Request

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "student": {
      "interest_field": "COMPUTER_SCIENCE",
      "preferred_country": "France",
      "preferred_language": "French",
      "target_degree": "MASTER",
      "current_degree": "BACHELOR",
      "gpa": 3.5,
      "language_level": "B2",
      "max_budget": 5000,
      "study_mode": "ON_CAMPUS",
      "needs_scholarship": false
    },
    "programs": [...]
  }'
```

## Model Info

- Algorithm: XGBoost Regressor
- Features: 26 engineered features (GPA diff, language match, field proximity, etc.)
- Output: Match score 0.0–1.0 (converted to 0–100%)
- Model file: `models/orientus_recommender_v1.pkl`

## ⚠️ Important Notes

- The model files (`models/`) **must be trained before** building the Docker image
- Run `python train_model.py` once before deployment
- Model files are volume-mounted in Docker to allow updates without rebuild

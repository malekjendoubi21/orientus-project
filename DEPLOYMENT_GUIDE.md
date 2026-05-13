# 🚀 Orientus — Deployment Guide

> Step-by-step instructions for the deployment team. Read this file first.

---

## 📋 Prerequisites

Before starting, ensure you have:

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| Docker Desktop | 24.0+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |
| Python | 3.10+ | `python --version` |
| Git | Any | `git --version` |

---

## ⚡ Step-by-Step Deployment

### STEP 1 — Clone & Enter the Project

```bash
git clone <repository-url> orientus_project
cd orientus_project
```

---

### STEP 2 — Configure Environment Variables

```bash
# Copy the template
cp .env.example .env

# Edit the file and fill in all CHANGE_ME values
notepad .env        # Windows
nano .env           # Linux/Mac
```

**Values you MUST fill in:**

| Variable | Where to get it |
|----------|----------------|
| `POSTGRES_PASSWORD` | Choose a strong password |
| `JWT_SECRET` | Run: `openssl rand -base64 64` |
| `GROQ_API_KEY` | https://console.groq.com/keys |
| `VITE_GOOGLE_MAPS_API_KEY` | https://console.cloud.google.com |
| `MAIL_USERNAME` | Your SMTP email address |
| `MAIL_PASSWORD` | SMTP App Password (not your login password) |

---

### STEP 3 — Train the ML Model (REQUIRED — First time only)

> ⚠️ The ML model files must exist before building the Docker image.

```bash
cd ml

# Install Python dependencies
pip install -r requirements.txt

# Train the model (takes ~1-2 minutes)
python train_model.py

# Verify model files were created
ls models/
# Expected:  orientus_recommender_v1.pkl   label_encoders.pkl

# Return to root
cd ..
```

---

### STEP 4 — Launch All Services

```bash
# Build and start everything (first run takes 5-10 minutes to download images)
docker compose -f docker-compose.full.yml up --build -d

# Follow logs to monitor startup
docker compose -f docker-compose.full.yml logs -f
```

**Startup order:**
1. PostgreSQL starts + healthcheck passes (~10s)
2. ML service starts (~15s)
3. Backend connects to DB + runs Hibernate migrations (~30-60s)
4. Frontend Nginx serves the app

---

### STEP 5 — Verify Everything is Running

```bash
# Check all containers are healthy
docker compose -f docker-compose.full.yml ps
```

Expected output:
```
NAME                  STATUS          PORTS
orientus-postgres     healthy         0.0.0.0:5432->5432/tcp
orientus-ml           running         0.0.0.0:5000->5000/tcp
orientus-backend      running         0.0.0.0:8084->8084/tcp
orientus-frontend     running         0.0.0.0:80->80/tcp
```

**Test endpoints:**
```bash
# ML Health
curl http://localhost:5000/health
# Expected: {"status":"UP","model_loaded":true}

# Backend Health
curl http://localhost:8084/api/auth/health
# Expected: 200 OK

# Frontend
# Open browser: http://localhost
```

---

### STEP 6 — First Login

```
URL:      http://localhost
Email:    admin@orientus.com
Password: Admin123!
```

> 🔴 **Change this password immediately after first login!**

---

## 🔧 Common Commands

```bash
# Stop all services
docker compose -f docker-compose.full.yml down

# Stop and delete data (WARNING: deletes database!)
docker compose -f docker-compose.full.yml down -v

# Restart a single service
docker compose -f docker-compose.full.yml restart backend

# View logs of a specific service
docker compose -f docker-compose.full.yml logs -f backend
docker compose -f docker-compose.full.yml logs -f ml
docker compose -f docker-compose.full.yml logs -f postgres

# Access the database
docker exec -it orientus-postgres psql -U orientus_user -d orientus_db

# Rebuild after code changes
docker compose -f docker-compose.full.yml up --build -d
```

---

## 📂 File Structure Reference

```
orientus_project/
│
├── README.md                    ← Project overview
├── DEPLOYMENT_GUIDE.md          ← This file ✅
├── docker-compose.full.yml      ← Launch ALL services (use this)
├── .env.example                 ← Environment variables template
├── .env                         ← Your actual secrets (DO NOT COMMIT)
├── .gitignore                   ← Protects secrets from git
│
├── frontend/                    ── FRONTEND (React + Vite)
│   ├── Dockerfile               ← Multi-stage: Node build → Nginx serve
│   ├── nginx.conf               ← Nginx config (SPA + API proxy)
│   ├── .env.example             ← Frontend env template
│   └── src/                    ← React source code
│
├── backend/                     ── BACKEND (Spring Boot)
│   ├── Dockerfile               ← Multi-stage: Maven build → JRE runtime
│   ├── DEPLOYMENT.md            ← Backend-specific deployment notes
│   ├── docker-compose.yml       ← DB only (for local dev without Docker full)
│   └── src/main/resources/
│       ├── application.properties          ← Real config (NOT in git)
│       └── application.properties.example  ← Template
│
└── ml/                          ── ML SERVICE (FastAPI + XGBoost)
    ├── Dockerfile               ← Python 3.10 slim image
    ├── README.md                ← ML service documentation
    ├── requirements.txt         ← Python dependencies
    ├── train_model.py           ← Run this BEFORE Docker build
    ├── serve_model.py           ← FastAPI app (entry point)
    └── models/                  ← Trained model files (gitignored if large)
```

---

## ❗ Troubleshooting

### Backend won't connect to DB
```bash
# Check if postgres is healthy
docker compose -f docker-compose.full.yml ps postgres
# Check backend logs for connection errors
docker compose -f docker-compose.full.yml logs backend | grep -i "error\|exception"
```

### ML model not loaded
```bash
# Verify model files exist
docker exec orientus-ml ls /app/models/
# If empty, run train_model.py OUTSIDE Docker first, then rebuild
```

### Frontend shows blank page
```bash
# Check if the build succeeded
docker compose -f docker-compose.full.yml logs frontend
# Verify environment variables were passed at build time
```

### Port already in use
```bash
# Find what's using port 8084 (Windows)
netstat -ano | findstr :8084
# Find what's using port 8084 (Linux)
lsof -i :8084
```

---

## 🔒 Production Security Notes

Before going live, update these settings:

1. **`application.properties`** (backend):
   ```properties
   spring.jpa.show-sql=false
   logging.level.root=WARN
   logging.level.com.example.orientus=INFO
   ```

2. **CORS**: Restrict to your production domain in the Spring Security config

3. **HTTPS**: Place Nginx or Traefik reverse proxy in front with SSL/TLS termination

4. **Volumes**: Ensure `uploads_data` and `postgres_data` Docker volumes are backed up regularly

---

## 📞 Contact

For technical questions about the codebase, contact the development team before deployment.

| Role | Info |
|------|------|
| Developer | Nader Ben Mimoun |
| Project | Orientus — AI University Orientation Platform |
| Version | 1.0.0 — PFE 2025-2026 |

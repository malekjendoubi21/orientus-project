# 🎓 Orientus — AI-Powered University Orientation Platform

> Orientus helps students find the right academic programs abroad through AI-powered recommendations, real-time chat, and an intuitive admin dashboard.

---

## 📁 Project Structure

```
orientus_project/
├── frontend/                   # React + TypeScript + Vite (Frontend)
├── backend/                    # Spring Boot (Backend API)
├── ml/                         # FastAPI + XGBoost (ML Recommendation Service)
├── docker-compose.full.yml     # Full-stack Docker Compose (all services)
└── README.md                   # This file
```

---

## 🏗️ Architecture Overview

```
┌─────────────────┐      HTTP/WS       ┌──────────────────────┐
│  React Frontend │ ──────────────────▶ │  Spring Boot Backend │
│   (Port 5173)   │                     │     (Port 8084)      │
└─────────────────┘                     └──────────┬───────────┘
                                                   │ HTTP
                                         ┌─────────▼───────────┐
                                         │   FastAPI ML Service │
                                         │      (Port 5000)    │
                                         └─────────────────────┘
                                                   │
                                         ┌─────────▼───────────┐
                                         │    PostgreSQL DB     │
                                         │     (Port 5432)     │
                                         └─────────────────────┘
```

---

## ⚙️ Tech Stack

| Layer        | Technology                         | Version  |
|--------------|------------------------------------|----------|
| Frontend     | React + TypeScript + Vite          | React 19 |
| Styling      | TailwindCSS v4                     | 4.x      |
| Backend      | Spring Boot                        | 4.0.2    |
| Database     | PostgreSQL                         | 16       |
| ML Service   | FastAPI + XGBoost                  | Python 3.10 |
| Auth         | JWT (HS512)                        | -        |
| Realtime     | WebSocket (STOMP)                  | -        |
| Email        | SMTP (Gmail / custom)              | -        |
| AI Chatbot   | Groq LLM (llama-3.3-70b)          | -        |

---

## 🚀 Quick Start — Docker (Recommended)

### Prerequisites
- Docker Desktop ≥ 24.0
- Docker Compose ≥ 2.20

### Steps

1. **Clone & configure environment variables:**
```bash
cp frontend/.env.example frontend/.env
# Edit the .env file with your API keys
```

2. **Configure backend secrets** (see `backend/src/main/resources/`):
   - Copy `application.properties.example` → `application.properties`
   - Fill in your database, JWT, email, and Groq API credentials

3. **Train the ML model** (first time only):
```bash
cd ml
pip install -r requirements.txt
python train_model.py
```

4. **Start all services:**
```bash
docker-compose -f docker-compose.full.yml up --build
```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8084/api
   - ML Service: http://localhost:5000/docs
   - API Swagger UI: http://localhost:8084/swagger-ui (if enabled)

---

## 🔑 Default Admin Credentials

```
Email:    admin@orientus.com
Password: Admin123!
```

> ⚠️ **IMPORTANT**: Change these credentials immediately after first deployment!

---

## 📖 Component READMEs

- [Frontend README](frontend/README.md)
- [Backend README](backend/DEPLOYMENT.md)
- [ML Service README](ml/README.md)

---

## 📋 Environment Variables Summary

### Frontend (`frontend/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | ✅ |
| `VITE_WS_URL` | WebSocket URL | ✅ |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API Key | ✅ |

### Backend (`application.properties`)
| Variable | Description | Required |
|----------|-------------|----------|
| `spring.datasource.url` | PostgreSQL connection URL | ✅ |
| `spring.datasource.username` | DB username | ✅ |
| `spring.datasource.password` | DB password | ✅ |
| `jwt.secret` | JWT signing key (min 64 chars) | ✅ |
| `groq.api.key` | Groq LLM API key | ✅ |
| `spring.mail.username` | SMTP email address | ✅ |
| `spring.mail.password` | SMTP app password | ✅ |
| `ml.api.url` | ML service URL | ✅ |
| `app.frontend.url` | Frontend URL (for email links) | ✅ |
| `app.rate-limit.chatbot-per-minute` | Chatbot requests/min per user | ✅ |
| `app.rate-limit.recommendations-per-minute` | Recommendation requests/min per user | ✅ |

---

## 🔒 Security Checklist Before Production

- [ ] Change default admin password
- [ ] Generate a new strong JWT secret key (min 64 chars, random)
- [ ] Rotate all API keys (Groq, Google Maps)
- [ ] Set `spring.jpa.show-sql=false` in production
- [ ] Set `logging.level.root=WARN` in production
- [ ] Enable HTTPS / TLS termination on reverse proxy
- [ ] Restrict CORS to production domain only
- [ ] Review PostgreSQL password strength
- [ ] Ensure `.env` and `application.properties` are NOT committed to git

---

## 🧪 Health Checks

| Service | Endpoint | Expected |
|---------|----------|----------|
| Backend | `GET /api/health` | `200 OK` |
| ML Service | `GET /health` | `{"status": "UP"}` |
| DB | `pg_isready` via Docker healthcheck | - |

---

## 👨‍💻 Development Team

| Role | Name |
|------|------|
| Lead Developer | Nader Ben Mimoun |
| Project | Orientus — PFE 2025-2026 |

---

## 📄 License

Private project — All rights reserved © 2025 Orientus

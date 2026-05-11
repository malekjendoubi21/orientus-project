# Orientus Backend — Deployment Guide

Spring Boot REST API for the Orientus platform.

## Tech Stack

- Java 17
- Spring Boot 4.0.2
- PostgreSQL 16
- JWT Authentication (HS512)
- WebSocket (STOMP)
- Groq LLM API (chatbot)
- SMTP Email

## Ports

| Service | Port |
|---------|------|
| Backend API | `8084` |
| PostgreSQL | `5432` |

## Local Development

### Prerequisites
- JDK 17+
- Maven 3.9+
- PostgreSQL 16 running locally (or via Docker)

### Start PostgreSQL with Docker
```bash
docker-compose up -d postgres
```

### Configure environment
Copy and edit `src/main/resources/application.properties`:
- Set your DB credentials
- Set your JWT secret (min 64 chars)
- Set your SMTP credentials
- Set your Groq API key

### Run the backend
```bash
./mvnw spring-boot:run
# Windows:
mvnw.cmd spring-boot:run
```

## Production Build

```bash
./mvnw clean package -DskipTests
java -jar target/orientus-*.jar
```

## Docker Build

```bash
docker build -t orientus-backend .
docker run -p 8084:8084 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/orientus_db \
  -e SPRING_DATASOURCE_USERNAME=orientus_user \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  -e JWT_SECRET=your_64_char_secret \
  -e GROQ_API_KEY=your_groq_key \
  -e SPRING_MAIL_USERNAME=contact@orient-us.com \
  -e SPRING_MAIL_PASSWORD=your_smtp_password \
  orientus-backend
```

## API Overview

| Module | Base Path | Auth Required |
|--------|-----------|---------------|
| Auth | `/api/auth/**` | ❌ |
| Programs | `/api/programs/**` | Partial |
| Users | `/api/users/**` | ✅ |
| Admin | `/api/admin/**` | ✅ ADMIN |
| Chatbot | `/api/chatbot/**` | ✅ |
| ML Recommend | `/api/recommendations/**` | ✅ |
| Messages | `/api/messages/**` | ✅ |
| Contact/Offices | `/api/offices/**` | Partial |
| Statistics | `/api/statistics/**` | ✅ ADMIN |

## Database

- JPA/Hibernate with `ddl-auto=update` (auto schema management)
- Flyway is disabled (handled by Hibernate for now)
- Uploads directory: `/app/uploads` (bind-mounted as Docker volume)

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | - | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | - | DB user |
| `SPRING_DATASOURCE_PASSWORD` | - | DB password |
| `JWT_SECRET` | - | HS512 signing key (64+ chars) |
| `JWT_EXPIRATION` | `86400000` | Token TTL in ms (24h) |
| `GROQ_API_KEY` | - | Groq LLM key |
| `SPRING_MAIL_USERNAME` | - | SMTP username |
| `SPRING_MAIL_PASSWORD` | - | SMTP app password |
| `ML_API_URL` | `http://localhost:5000` | ML service URL |
| `APP_FRONTEND_URL` | `http://localhost:5173` | Used in email links |

## ⚠️ Production Checklist

- [ ] Set `spring.jpa.show-sql=false`
- [ ] Set `logging.level.root=WARN`
- [ ] Use a strong random JWT secret
- [ ] Enable HTTPS via reverse proxy (Nginx / Traefik)
- [ ] Mount uploads volume for persistence

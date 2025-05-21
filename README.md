# Sentinel Auth Backend

This is the backend authentication service for the **Sentinel** project. It provides secure, scalable, and extensible user authentication and authorization functionality using OAuth2, OpenID Connect, JWTs, password hashing, and various login methods.

---

## 💪 Tech Stack

- **Language**: Golang
- **API Definition**: OpenAPI Spec
- **Containerization**: Docker, Docker Compose
- **Authentication Protocols**: OAuth2, OpenID Connect (OIDC)
- **Token Types**:
  - JWT (access & refresh tokens)
  - Session-based support (via cookies)
- **Database**:
  - PostgreSQL (primary)
  - Redis (optional/session management)

---

## 🔐 Supported Sign-In Methods

- Email + Password (with salted hashing)
- Google Sign-In
- LinkedIn Sign-In
- Microsoft Sign-In
- Phone + Passcode (planned)
- Two-Factor Authentication (planned)
- Multiple providers linked to a single user account

---

## 📂 Project Structure

- `main.go` — Entry point for the web server
- `docker-compose.yaml` — Config for local container orchestration
- `Dockerfile` — Docker build configuration
- `go.mod` — Go module dependencies
- `db.dbml` — Entity Relationship Diagram (ERD)
- `LIBS.md` — List of packages/libraries used

---

## ⚙️ Local Development

Make sure you have Docker and Docker Compose installed.

### Run the app

```bash
docker-compose up --build
```

Access the app at [http://104.248.57.142:8080](http://104.248.57.142:8080)

---

## 🧪 Sample Endpoint

A basic health check endpoint is included:

```http
GET /
```

Returns:

```
Hello, World!
```

---

## 📚 Libraries Used

See [LIBS.md](./LIBS.md) for all libraries used, including:

- `gorilla/sessions` for secure session management
- `golang-jwt/jwt` for handling JWTs
- `bcrypt`, `argon2`, and `securecookie` for password & cookie security
- `pgx`, `gorm` for database interaction

---

## 🔒 Security Practices

- Passwords are hashed with salt before being stored
- JWTs are used for stateless auth; refresh tokens supported
- Access tokens are short-lived; refresh tokens are long-lived
- Code challenge & verifier flow (PKCE) supported
- Secrets (like client secrets) are **never** exposed in the frontend

---

## 🧠 Future Plans

- Add admin portal + todo demo app
- Kubernetes deployment support
- Session store using Redis
- Implement multi-factor auth (2FA)

---

## 📌 References & Inspirations

- [Supabase Auth](https://supabase.com/docs/guides/auth/architecture)
- [Casdoor Docs](https://casdoor.org/docs/)
- [SuperTokens](https://supertokens.com/)
- [Frontegg Blogs](https://frontegg.com/blog/)
- [Authentik](https://docs.goauthentik.io/)


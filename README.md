# DO-50 Dockerized Sports Rust Service (3-Tier Architecture)

A robust, fully containerized Sports Platform built with a **3-Tier Microservice Architecture**. The project features a stunning standalone Nginx frontend, a high-performance Rust API, and a PostgreSQL database, all securely orchestrated via Docker Compose with healthchecks.

## 📖 About the Project
This project was developed for the DevOps (DO-50) assignment. It demonstrates how to properly create, containerize, and orchestrate a distributed application from development to production utilizing modern DevOps strategies. 

Features include:
- **Premium Frontend UI**: A bespoke, dynamic Javascript/CSS "Glassmorphism" interface served exclusively by an Nginx web server.
- **Fast & Safe Backend**: Built natively with Rust, Axum, and Tokio.
- **Database Integration**: PostgreSQL connected asynchronously via SQLx.
- **Multi-Stage Docker Builds**: Optimizes the final Docker image footprint and maximizes security constraints by deploying without the compiler.
- **Container Orchestration**: Docker Compose network with strict `healthcheck` boot-order mapping to eradicate race conditions.
- **Reverse Proxy**: Nginx forwards API traffic internally to securely shield the Rust backend from the internet.
- **CI/CD pipeline**: GitHub Actions implementing testing, formatting, linting, and Docker loops.
- **K8s Ready**: Initial deployment and service configuration for scaling.

## 📐 System Architecture

### High-Level Design (HLD)
The system is divided into an isolated frontend UI, backend API, and a Stateful database, connected via a private Docker Network.
- **Browser Client** -> `HTTP Port 3000` -> **Nginx Frontend Container** (Reverse Proxy) -> `HTTP Port 8080` -> **Rust Sports API Container** -> `TCP Port 5432` -> **PostgreSQL Container** (Stateful Volume)

### Low-Level Design (LLD)
- **Frontend Nginx Proxy**: The `frontend` container hosts a vanilla UI and routes `/api/` traffic cleanly backward, resolving CORS friction natively.
- **Frameworking**: `Axum` provides the web routing. Requests directed to `/teams` invoke asynchronous `tokio::spawn` closures.
- **State Extraction**: Database connection pool (`PgPool`) is globally established during application startup and injected into routes via Axum's `State` extractor.
- **Data Serialization**: `Serde` handles mapping JSON requests/responses exactly to Rust `Team` structs.
- **Dockerization Strategy**:
  - *Stage 1 (Builder)*: Heavyweight `rust:bookworm` compiles source code into a release binary.
  - *Stage 2 (Runtime)*: Minimal `debian:bookworm-slim` securely runs the application under a dynamically initiated `appuser` (non-root permissions constraint). 
- **Graceful Orchestration**: The Rust container uses `condition: service_healthy` to wait for PostgreSQL's `pg_isready` probe before booting.

## 👥 Team Members (Group: Placed BtechGroup07, Division D4)
| # | Name | Enrollment No |
|---|---|---|
| 1 | Himani Jaiswal | EN22CS301423 |
| 2 | Irya Patni | EN22CS301436 |
| 3 | Uday Dubey | EN22EL301058 |
| 4 | Chetan Oswal | EN22CS301295 |

## 🛠️ Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed.
- Git.

## 🚀 Setup & Execution 

1. **Spin up the environment:**
   Use Docker Compose to build the containers. The orchestration will automatically handle downloading the environments, building the Rust binary, and booting the UI in the correct order.
   ```bash
   docker-compose up --build
   ```

2. **Access the Application Dashboard:**
   Once the terminal reads that all three containers are healthy and running, open your web browser and navigate to:
   👉 **http://localhost:3000**
   
   *You can use the beautiful UI to interactively add teams and view the roster in real-time.*

3. **(Optional) Direct Backend API Access:**
   If you wish to test the Rust API directly via the terminal:
   ```bash
   curl http://localhost:8080/teams
   ```

4. **Shutdown:**
   Gracefully bring down the orchestrations:
   ```bash
   docker-compose down
   ```

# Stage 1: Build the application
FROM rust:bookworm AS builder

# Create a new empty shell project
WORKDIR /usr/src/sports-service

# Copy manifests
COPY Cargo.toml Cargo.lock* ./

# Copy source code
COPY src ./src

# Build for release
RUN cargo build --release

# Stage 2: Create a minimal runtime image
FROM debian:bookworm-slim

# Install system dependencies (e.g. for native-tls / PostgreSQL)
RUN apt-get update && \
    apt-get install -y openssl libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Add a non-root user for security
RUN useradd -ms /bin/bash appuser

WORKDIR /usr/local/bin

# Copy the built binary from the builder stage
COPY --from=builder /usr/src/sports-service/target/release/sports-service .

# Change ownership of the binary to our non-root user
RUN chown appuser:appuser sports-service

# Switch to the non-root user
USER appuser

EXPOSE 8080

CMD ["sports-service"]

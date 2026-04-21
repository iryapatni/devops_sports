use axum::{
    routing::{get, post},
    Router, Json, extract::State,
};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPoolOptions;
use std::env;

#[derive(Serialize, Deserialize, sqlx::FromRow)]
struct Team {
    id: i32,
    name: String,
    city: String,
}

#[derive(Deserialize)]
struct CreateTeam {
    name: String,
    city: String,
}

#[derive(Clone)]
struct AppState {
    db: sqlx::PgPool,
}

#[tokio::main]
async fn main() {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:password@db:5432/sports_db".to_string());

    // Connect to PostgreSQL
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to postgres");

    // Start with a basic struct initialization query to ensure the table exists
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS teams (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL
        );"
    )
    .execute(&pool)
    .await
    .unwrap();

    let app_state = AppState { db: pool };

    let app = Router::new()
        .route("/", get(|| async { "Sports Service is running!" }))
        .route("/teams", get(get_teams).post(create_team))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("Listening on 0.0.0.0:8080");
    axum::serve(listener, app).await.unwrap();
}

async fn get_teams(State(state): State<AppState>) -> Json<Vec<Team>> {
    let teams = sqlx::query_as::<_, Team>("SELECT id, name, city FROM teams")
        .fetch_all(&state.db)
        .await
        .unwrap_or_else(|_| vec![]);

    Json(teams)
}

async fn create_team(
    State(state): State<AppState>,
    Json(payload): Json<CreateTeam>,
) -> Json<Team> {
    let team = sqlx::query_as::<_, Team>(
        "INSERT INTO teams (name, city) VALUES ($1, $2) RETURNING id, name, city"
    )
    .bind(payload.name)
    .bind(payload.city)
    .fetch_one(&state.db)
    .await
    .unwrap();

    Json(team)
}

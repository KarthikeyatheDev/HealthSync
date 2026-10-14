"""
HealthSync Federated Learning FastAPI Application.
Wires all clinical routers, real-time SSE streaming, and CORS middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import (
    dashboard,
    sites,
    rounds,
    predict,
    models,
    logs,
    events,
    settings,
    xai,
)

app = FastAPI(
    title="HealthSync Federated Learning Backend",
    description="Decentralized multi-task clinical AI platform for Heart Disease & Diabetes prediction.",
    version="1.2.0"
)

# Enable CORS for Vite frontend (http://localhost:5173 / any network IP)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(sites.router)
app.include_router(rounds.router)
app.include_router(predict.router)
app.include_router(models.router)
app.include_router(logs.router)
app.include_router(events.router)
app.include_router(settings.router)
app.include_router(xai.router)

@app.get("/")
def root():
    return {
        "service": "HealthSync Federated Healthcare Intelligence API",
        "version": "1.2.0",
        "docs_url": "/docs",
        "health": "/api/health",
        "dashboard": "/api/dashboard"
    }

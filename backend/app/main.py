from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import suppliers, assessments, scoring, recommendations, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    from app.seed import seed
    await seed()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Advanced Cyber Risk Management for IT/OT Suppliers",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(suppliers.router, prefix="/api/suppliers", tags=["Suppliers"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Assessments"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["Scoring"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


@app.get("/")
async def root():
    return {"message": "SUPPLYSHIELD API Running", "version": settings.APP_VERSION}


@app.get("/health")
async def health():
    return {"status": "healthy"}
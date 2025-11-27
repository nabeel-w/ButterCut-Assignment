from fastapi import APIRouter
from app.api.v1.routes_jobs import router as jobs_router
from app.api.v1.routes_overlays import router as overlays_router

api_router = APIRouter()
api_router.include_router(jobs_router, prefix="", tags=["jobs"])
api_router.include_router(overlays_router, prefix="", tags=["overlay-assets"])

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, otb, kpi, comments

app = FastAPI(
    title="OTB Planning Tool",
    description="Open-To-Buy Planning API for retail merchandising teams",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(otb.router, prefix="/api/otb", tags=["OTB"])
app.include_router(kpi.router, prefix="/api/otb/{otb_id}/kpi", tags=["KPI"])
app.include_router(comments.router, prefix="/api/otb/{otb_id}/comments", tags=["Comments"])


@app.get("/")
def root():
    return {"message": "OTB Planning Tool API", "docs": "/docs"}

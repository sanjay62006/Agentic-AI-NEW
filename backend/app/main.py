from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine
from app.models.models import Base
from app.api import auth, resume, assessment, jobs, career, interview

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Job Portal", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(assessment.router)
app.include_router(jobs.router)
app.include_router(career.router)
app.include_router(interview.router)

@app.get("/")
def root():
    return {"message": "AI Job Portal API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, Resume
from app.services.auth_service import get_current_user
from app.agents.resume_agent import analyze_resume

router = APIRouter(prefix="/api/resume", tags=["resume"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 5MB")

    data = analyze_resume(file_bytes, file.filename)

    resume = Resume(
        user_id=current_user.id,
        filename=data["filename"],
        raw_text=data["raw_text"],
        skills=data["skills"],
        education=data["education"],
        experience=data["experience"],
        projects=data["projects"],
        certifications=data["certifications"],
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "id": resume.id,
        "filename": resume.filename,
        "skills": resume.skills,
        "education": resume.education,
        "experience": resume.experience,
        "projects": resume.projects,
        "certifications": resume.certifications,
    }

@router.get("/latest")
def get_latest_resume(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
    return {
        "id": resume.id,
        "filename": resume.filename,
        "skills": resume.skills,
        "education": resume.education,
        "experience": resume.experience,
        "projects": resume.projects,
        "certifications": resume.certifications,
    }

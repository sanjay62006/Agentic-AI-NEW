from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, Resume, CandidateLevel
from app.services.auth_service import get_current_user
from app.agents.job_matching_agent import match_jobs

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("/recommendations")
def get_job_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    cl = db.query(CandidateLevel).filter(CandidateLevel.user_id == current_user.id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Please upload a resume first")

    level = cl.level if cl else "Beginner"
    score = cl.overall_score if cl else 0
    jobs = match_jobs(resume.skills or [], level, score)
    return {"jobs": jobs, "level": level, "total": len(jobs)}

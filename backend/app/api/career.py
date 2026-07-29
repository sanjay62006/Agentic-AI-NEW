from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, Resume, CandidateLevel
from app.services.auth_service import get_current_user
from app.agents.skill_gap_agent import find_skill_gap, ROLE_SKILLS
from app.agents.career_agent import generate_roadmap
from app.agents.learning_agent import recommend_learning

router = APIRouter(prefix="/api/career", tags=["career"])

@router.get("/skill-gap")
def get_skill_gap(
    target_role: str = "Backend Developer",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Please upload a resume first")
    return find_skill_gap(resume.skills or [], target_role)

@router.get("/roles")
def get_available_roles():
    return {"roles": list(ROLE_SKILLS.keys())}

@router.get("/roadmap")
def get_roadmap(
    target_role: str = "Backend Developer",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    cl = db.query(CandidateLevel).filter(CandidateLevel.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Please upload a resume first")

    gap = find_skill_gap(resume.skills or [], target_role)
    level = cl.level if cl else "Beginner"
    return generate_roadmap(level, resume.skills or [], target_role, gap["missing_skills"])

@router.get("/learning")
def get_learning(
    target_role: str = "Backend Developer",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    cl = db.query(CandidateLevel).filter(CandidateLevel.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Please upload a resume first")

    gap = find_skill_gap(resume.skills or [], target_role)
    level = cl.level if cl else "Beginner"
    resources = recommend_learning(gap["missing_skills"], level)
    return {"resources": resources, "target_role": target_role, "missing_skills": gap["missing_skills"]}

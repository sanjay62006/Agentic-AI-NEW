from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, Resume, Assessment, CandidateLevel
from app.services.auth_service import get_current_user
from app.agents.question_generator_agent import generate_questions
from app.agents.answer_evaluator_agent import evaluate_answer, calculate_overall_score
from app.agents.candidate_level_agent import classify_candidate
from pydantic import BaseModel

router = APIRouter(prefix="/api/assessment", tags=["assessment"])

class AnswerPayload(BaseModel):
    answers: list  # [{"assessment_id": int, "answer": str}]

@router.post("/generate")
def generate_assessment(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    if resume:
        resume_data = {
            "skills": resume.skills or [],
            "projects": resume.projects or [],
            "experience": resume.experience or [],
            "education": resume.education or [],
        }
    else:
        resume_data = {
            "skills": ["Python", "JavaScript", "SQL", "React", "Git", "FastAPI"],
            "projects": ["Full-stack Web Application", "REST API Service"],
            "experience": ["Software Developer"],
            "education": ["Computer Science"],
        }

    # Clear old assessments
    db.query(Assessment).filter(Assessment.user_id == current_user.id).delete()
    db.commit()

    questions = generate_questions(resume_data)

    saved = []
    for q in questions:
        assessment = Assessment(
            user_id=current_user.id,
            question=q["question"],
            question_type=q.get("type", "technical"),
            skill_tag=q.get("skill_tag", "General"),
        )
        db.add(assessment)
        db.flush()
        saved.append({"id": assessment.id, "question": assessment.question, "question_type": assessment.question_type, "skill_tag": assessment.skill_tag})
    
    db.commit()
    return {"questions": saved, "total": len(saved)}

@router.post("/submit")
def submit_answers(payload: AnswerPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    evaluations = []
    
    for item in payload.answers:
        assessment = db.query(Assessment).filter(
            Assessment.id == item["assessment_id"],
            Assessment.user_id == current_user.id
        ).first()
        if not assessment:
            continue

        result = evaluate_answer(assessment.question, item["answer"], assessment.skill_tag)
        assessment.answer = item["answer"]
        assessment.score = result.get("score", 0)
        assessment.feedback = result.get("feedback", "")
        assessment.correctness = result.get("correctness", 0)
        assessment.confidence = result.get("confidence", 0)
        evaluations.append({**result, "skill_tag": assessment.skill_tag})

    db.commit()

    score_data = calculate_overall_score(evaluations)
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    skills_count = len(resume.skills) if (resume and resume.skills) else 5
    
    level_data = classify_candidate(score_data["overall_score"], skills_count)

    # Save or update candidate level
    cl = db.query(CandidateLevel).filter(CandidateLevel.user_id == current_user.id).first()
    if cl:
        cl.overall_score = score_data["overall_score"]
        cl.level = level_data["level"]
        cl.skill_scores = score_data["skill_scores"]
    else:
        cl = CandidateLevel(
            user_id=current_user.id,
            overall_score=score_data["overall_score"],
            level=level_data["level"],
            skill_scores=score_data["skill_scores"],
        )
        db.add(cl)
    db.commit()

    return {
        "overall_score": score_data["overall_score"],
        "skill_scores": score_data["skill_scores"],
        "level": level_data["level"],
        "level_description": level_data["description"],
        "color": level_data["color"],
        "total_evaluated": len(evaluations),
    }

@router.get("/results")
def get_results(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cl = db.query(CandidateLevel).filter(CandidateLevel.user_id == current_user.id).first()
    if not cl:
        raise HTTPException(status_code=404, detail="No assessment results found")
    
    assessments = db.query(Assessment).filter(
        Assessment.user_id == current_user.id,
        Assessment.answer != None
    ).all()

    return {
        "overall_score": cl.overall_score,
        "level": cl.level,
        "skill_scores": cl.skill_scores,
        "details": [{"question": a.question, "answer": a.answer, "score": a.score, "feedback": a.feedback, "skill_tag": a.skill_tag} for a in assessments]
    }

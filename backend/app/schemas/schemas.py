from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# Resume
class ResumeData(BaseModel):
    skills: List[str]
    education: List[str]
    experience: List[str]
    projects: List[str]
    certifications: List[str]

class ResumeResponse(BaseModel):
    id: int
    filename: str
    skills: List[str]
    education: List[str]
    experience: List[str]
    projects: List[str]
    certifications: List[str]

# Assessment
class QuestionOut(BaseModel):
    id: int
    question: str
    question_type: str
    skill_tag: str

class AnswerSubmit(BaseModel):
    assessment_id: int
    answer: str

class EvaluationResult(BaseModel):
    assessment_id: int
    score: float
    feedback: str
    correctness: float
    confidence: float

class AssessmentSummary(BaseModel):
    overall_score: float
    level: str
    skill_scores: Dict[str, float]
    total_questions: int

# Jobs
class JobOut(BaseModel):
    title: str
    company: str
    level: str
    skills_required: List[str]
    description: str
    match_score: float

# Skill Gap
class SkillGapOut(BaseModel):
    current_skills: List[str]
    required_skills: List[str]
    missing_skills: List[str]
    match_percentage: float

# Career Roadmap
class RoadmapStep(BaseModel):
    step: int
    title: str
    description: str
    duration: str
    resources: List[str]

class RoadmapOut(BaseModel):
    current_level: str
    target_role: str
    steps: List[RoadmapStep]

# Learning
class CourseOut(BaseModel):
    title: str
    platform: str
    url: str
    type: str
    skill: str
    duration: str

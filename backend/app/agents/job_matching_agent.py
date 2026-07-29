JOB_DATABASE = [
    {"title": "Junior Python Developer", "company": "TechCorp", "level": "Beginner", "skills_required": ["python", "sql", "git"], "description": "Build and maintain Python applications.", "salary": "3-5 LPA"},
    {"title": "Frontend Intern", "company": "StartupXYZ", "level": "Beginner", "skills_required": ["html", "css", "javascript", "react"], "description": "Develop responsive UI components.", "salary": "2-4 LPA"},
    {"title": "Data Analyst Intern", "company": "DataCo", "level": "Beginner", "skills_required": ["python", "sql", "pandas", "excel"], "description": "Analyze datasets and create reports.", "salary": "2-4 LPA"},
    {"title": "Backend Developer", "company": "WebSolutions", "level": "Intermediate", "skills_required": ["python", "fastapi", "postgresql", "docker", "rest api"], "description": "Design and build scalable REST APIs.", "salary": "6-10 LPA"},
    {"title": "Full Stack Developer", "company": "InnovateTech", "level": "Intermediate", "skills_required": ["react", "node", "sql", "git", "docker"], "description": "Build end-to-end web applications.", "salary": "7-12 LPA"},
    {"title": "Junior ML Engineer", "company": "AI Labs", "level": "Intermediate", "skills_required": ["python", "machine learning", "scikit-learn", "pandas", "numpy"], "description": "Develop and deploy ML models.", "salary": "8-12 LPA"},
    {"title": "DevOps Engineer", "company": "CloudBase", "level": "Intermediate", "skills_required": ["docker", "kubernetes", "aws", "ci/cd", "linux"], "description": "Manage cloud infrastructure and deployments.", "salary": "10-15 LPA"},
    {"title": "Senior Software Engineer", "company": "BigTech", "level": "Advanced", "skills_required": ["python", "system design", "aws", "docker", "postgresql"], "description": "Lead development of large-scale systems.", "salary": "18-30 LPA"},
    {"title": "ML Engineer", "company": "DeepMind Co", "level": "Advanced", "skills_required": ["python", "tensorflow", "pytorch", "deep learning", "aws"], "description": "Research and deploy production ML systems.", "salary": "20-35 LPA"},
    {"title": "Cloud Architect", "company": "CloudFirst", "level": "Advanced", "skills_required": ["aws", "azure", "terraform", "kubernetes", "docker"], "description": "Design enterprise cloud architectures.", "salary": "25-40 LPA"},
]

def match_jobs(skills: list, level: str, overall_score: float) -> list:
    skills_lower = [s.lower() for s in skills]
    results = []

    for job in JOB_DATABASE:
        required = job["skills_required"]
        matched = [s for s in required if s in skills_lower]
        match_score = round((len(matched) / len(required)) * 100, 1) if required else 0

        # Level filtering with some flexibility
        level_map = {"Beginner": 0, "Intermediate": 1, "Advanced": 2}
        candidate_lvl = level_map.get(level, 0)
        job_lvl = level_map.get(job["level"], 0)

        if abs(candidate_lvl - job_lvl) <= 1 and match_score >= 30:
            results.append({**job, "match_score": match_score, "matched_skills": matched})

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:6]

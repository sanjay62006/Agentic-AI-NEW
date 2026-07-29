ROLE_SKILLS = {
    "Backend Developer": ["python", "fastapi", "postgresql", "docker", "rest api", "git", "redis"],
    "Frontend Developer": ["react", "typescript", "html", "css", "tailwind", "git", "javascript"],
    "Full Stack Developer": ["react", "node", "python", "postgresql", "docker", "git", "rest api"],
    "ML Engineer": ["python", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "aws", "docker"],
    "DevOps Engineer": ["docker", "kubernetes", "aws", "ci/cd", "linux", "terraform", "ansible", "git"],
    "Data Analyst": ["python", "sql", "pandas", "tableau", "power bi", "excel", "numpy"],
    "Cloud Engineer": ["aws", "azure", "gcp", "terraform", "docker", "kubernetes", "linux"],
}

def find_skill_gap(current_skills: list, target_role: str) -> dict:
    current_lower = [s.lower() for s in current_skills]
    required = ROLE_SKILLS.get(target_role, [])
    missing = [s for s in required if s not in current_lower]
    present = [s for s in required if s in current_lower]
    match_pct = round((len(present) / len(required)) * 100, 1) if required else 0

    return {
        "target_role": target_role,
        "current_skills": current_lower,
        "required_skills": required,
        "present_skills": present,
        "missing_skills": missing,
        "match_percentage": match_pct
    }

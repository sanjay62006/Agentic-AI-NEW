import re
import PyPDF2
from io import BytesIO

SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "react", "angular", "vue", "node",
    "fastapi", "django", "flask", "spring", "sql", "postgresql", "mysql", "mongodb",
    "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git", "linux",
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
    "pandas", "numpy", "opencv", "nlp", "langchain", "rest api", "graphql",
    "html", "css", "tailwind", "bootstrap", "c++", "c#", "go", "rust", "kotlin",
    "swift", "flutter", "react native", "firebase", "supabase", "ci/cd", "jenkins",
    "terraform", "ansible", "spark", "hadoop", "tableau", "power bi", "excel"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(BytesIO(file_bytes))
    return " ".join(page.extract_text() or "" for page in reader.pages)

def extract_skills(text: str) -> list:
    text_lower = text.lower()
    return list({skill for skill in SKILL_KEYWORDS if skill in text_lower})

def extract_section(text: str, headers: list, next_headers: list) -> list:
    lines = []
    in_section = False
    for line in text.split("\n"):
        line_lower = line.strip().lower()
        if any(h in line_lower for h in headers):
            in_section = True
            continue
        if in_section and any(h in line_lower for h in next_headers):
            break
        if in_section and line.strip():
            lines.append(line.strip())
    return lines[:10]

def analyze_resume(file_bytes: bytes, filename: str) -> dict:
    text = extract_text_from_pdf(file_bytes)
    skills = extract_skills(text)
    education = extract_section(text, ["education", "academic"], ["experience", "skills", "projects", "certifications"])
    experience = extract_section(text, ["experience", "work history", "employment"], ["education", "skills", "projects", "certifications"])
    projects = extract_section(text, ["projects", "project"], ["education", "skills", "experience", "certifications"])
    certifications = extract_section(text, ["certifications", "certificates", "achievements"], ["education", "skills", "projects", "experience"])
    return {
        "filename": filename,
        "raw_text": text[:5000],
        "skills": skills,
        "education": education or ["Not found"],
        "experience": experience or ["Not found"],
        "projects": projects or ["Not found"],
        "certifications": certifications or ["Not found"],
    }

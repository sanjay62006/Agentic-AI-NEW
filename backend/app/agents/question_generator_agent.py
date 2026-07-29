import os
import json
import random
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key and api_key != "your-openai-api-key" else None

SKILL_QUESTION_BANK = {
    "python": [
        "In Python, explain the difference between list comprehension, generator expressions, and how memory is allocated for large datasets.",
        "How do GIL (Global Interpreter Lock) and asynchronous IO (`asyncio`) affect concurrency in Python applications?",
        "Explain how Python decorators work under the hood and write a concept decorator for measuring function execution time."
    ],
    "javascript": [
        "Explain the JavaScript Event Loop, Call Stack, Microtask queue, and Macrotask queue with an example.",
        "What is closure in JavaScript? Provide a real-world scenario where closures are beneficial or cause memory leaks.",
        "Compare `Promise.all` vs `Promise.allSettled` vs `Promise.race` in modern JavaScript async programming."
    ],
    "typescript": [
        "How do TypeScript Generics enhance type safety and code reusability in complex web applications?",
        "Explain the difference between `interface` and `type` alias in TypeScript, and when you should prefer one over the other."
    ],
    "react": [
        "How does React's Virtual DOM reconciliation process work, and how do `useMemo` and `useCallback` prevent unnecessary re-renders?",
        "Compare Redux, Context API, and Zustand for state management in large scale React applications.",
        "Explain the React component lifecycle in Functional Components using `useEffect` and custom hooks."
    ],
    "node": [
        "How does Node.js handle non-blocking I/O operations using libuv and the event loop?",
        "How do streams and buffers in Node.js help process multi-gigabyte files efficiently without overflowing memory?"
    ],
    "fastapi": [
        "How does FastAPI leverage Python type hints, Pydantic, and Starlette for automatic validation and OpenAPI documentation?",
        "Explain dependency injection in FastAPI using `Depends` and how database sessions should be managed cleanly."
    ],
    "sql": [
        "Explain the difference between clustered and non-clustered indexes in SQL databases and how they impact query performance.",
        "What are ACID properties in relational databases, and how do database isolation levels prevent race conditions?"
    ],
    "postgresql": [
        "How do PostgreSQL JSONB indexing and GIN indexes optimize query performance over unstructured JSON data?",
        "Explain transaction isolation levels in PostgreSQL and how MVCC (Multi-Version Concurrency Control) works."
    ],
    "docker": [
        "Explain multi-stage Docker builds and how they help minimize image size and improve deployment security.",
        "What is the difference between Docker containers, volumes, and bind mounts, and how do you handle persistent storage?"
    ],
    "git": [
        "Explain the difference between `git merge` and `git rebase`, and in what scenarios is rebasing preferred?",
        "How do you resolve complex merge conflicts and roll back a problematic commit without losing history?"
    ],
    "machine learning": [
        "Explain the trade-off between bias and variance in Machine Learning models, and how to diagnose overfitting.",
        "How do cross-validation and feature scaling improve model generalization performance?"
    ],
    "aws": [
        "How do you design a high-availability architecture on AWS using EC2, Auto Scaling Groups, and Application Load Balancers?",
        "Explain the difference between AWS IAM Roles and IAM Users, and how to apply the principle of least privilege."
    ]
}

DEFAULT_QUESTIONS = [
    {"question": "Walk us through a complex technical challenge you faced in one of your recent projects and how you solved it.", "type": "project", "skill_tag": "Project Architecture"},
    {"question": "How do you ensure code quality, testability, and maintainability when building new software features?", "type": "project", "skill_tag": "Software Engineering"},
    {"question": "Describe your approach to designing scalable RESTful APIs with proper error handling and status codes.", "type": "project", "skill_tag": "API Design"},
    {"question": "Tell us about a time when you had a technical disagreement with a team member. How did you resolve it?", "type": "hr", "skill_tag": "Behavioral"},
    {"question": "How do you prioritize competing tasks when working under tight project deadlines?", "type": "hr", "skill_tag": "Time Management"},
    {"question": "Explain the trade-offs between monolithic architecture and microservices architecture.", "type": "conceptual", "skill_tag": "System Architecture"},
    {"question": "What is caching, and how would you implement Redis caching to speed up slow database queries?", "type": "conceptual", "skill_tag": "Performance Optimization"}
]

def generate_fallback_questions(resume_data: dict) -> list:
    skills = [s.strip().lower() for s in resume_data.get("skills", []) if isinstance(s, str)]
    projects = resume_data.get("projects", [])
    
    questions = []
    used_tags = set()

    # 1. Technical Questions (5) based on actual resume skills
    for skill in skills:
        if len(questions) >= 5:
            break
        if skill in SKILL_QUESTION_BANK:
            q_text = random.choice(SKILL_QUESTION_BANK[skill])
            questions.append({"question": q_text, "type": "technical", "skill_tag": skill.title()})
            used_tags.add(skill.title())

    # Fill remaining technical questions if skills were few
    generic_tech = [
        {"question": "Explain how object-oriented programming (OOP) principles like encapsulation and polymorphism improve code structure.", "type": "technical", "skill_tag": "OOP Concepts"},
        {"question": "How do data structures like Hash Tables, Arrays, and Trees differ in time complexity for search and insert operations?", "type": "technical", "skill_tag": "Data Structures"},
        {"question": "Explain the difference between synchronous and asynchronous execution in modern web development.", "type": "technical", "skill_tag": "Async Programming"},
        {"question": "What strategies do you use for database indexing and query optimization when dealing with large datasets?", "type": "technical", "skill_tag": "Database Design"},
        {"question": "How do authentication mechanisms like JWT (JSON Web Tokens) work, and how do you secure API endpoints?", "type": "technical", "skill_tag": "Web Security"}
    ]
    for g in generic_tech:
        if len(questions) >= 5:
            break
        if g["skill_tag"] not in used_tags:
            questions.append(g)
            used_tags.add(g["skill_tag"])

    # 2. Add Project Questions (3), Behavioral (2), Conceptual (2)
    questions.extend(DEFAULT_QUESTIONS[:7])

    return questions[:12]

def generate_questions(resume_data: dict) -> list:
    skills = resume_data.get("skills", [])
    projects = resume_data.get("projects", [])
    experience = resume_data.get("experience", [])
    education = resume_data.get("education", [])

    # Format skills properly if list of strings or dicts
    clean_skills = [s if isinstance(s, str) else str(s) for s in skills]

    if client:
        try:
            prompt = f"""You are a technical interviewer. Based on this candidate's resume, generate exactly 12 interview questions.

Resume Details:
- Skills: {', '.join(clean_skills[:15])}
- Projects: {'; '.join([str(p) for p in projects[:3]])}
- Experience: {'; '.join([str(e) for e in experience[:3]])}
- Education: {'; '.join([str(ed) for ed in education[:2]])}

Generate a mix of:
- 5 technical questions about their specific skills
- 3 project-based questions
- 2 HR/behavioral questions
- 2 conceptual/theoretical questions

Return ONLY a JSON array with this exact format:
[
  {{"question": "...", "type": "technical", "skill_tag": "Python"}},
  ...
]
Types must be one of: technical, project, hr, conceptual"""

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            start = content.find("[")
            end = content.rfind("]") + 1
            if start != -1 and end != 0:
                questions = json.loads(content[start:end])
                if isinstance(questions, list) and len(questions) > 0:
                    return questions[:12]
        except Exception as e:
            print(f"OpenAI Generation error fallback triggered: {e}")

    # Fallback if OpenAI fails or is not configured
    return generate_fallback_questions(resume_data)


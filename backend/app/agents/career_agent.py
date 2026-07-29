import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key and api_key != "your-openai-api-key" else None

def generate_roadmap(level: str, skills: list, target_role: str, missing_skills: list) -> dict:
    if client:
        try:
            prompt = f"""Create a career roadmap for a candidate.

Current Level: {level}
Current Skills: {', '.join(skills[:10])}
Target Role: {target_role}
Missing Skills: {', '.join(missing_skills[:8])}

Return ONLY a JSON object:
{{
  "current_level": "{level}",
  "target_role": "{target_role}",
  "estimated_time": "<e.g. 6-12 months>",
  "steps": [
    {{
      "step": 1,
      "title": "<milestone title>",
      "description": "<what to do>",
      "duration": "<e.g. 2 weeks>",
      "resources": ["<resource 1>", "<resource 2>"]
    }}
  ]
}}

Generate 5-7 steps. Be specific and actionable."""

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=1500
            )
            content = response.choices[0].message.content.strip()
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end != 0:
                return json.loads(content[start:end])
        except Exception as e:
            print(f"OpenAI Roadmap error fallback triggered: {e}")

    # Fallback Roadmap Generator
    steps = [
        {
            "step": 1,
            "title": "Foundational Skill Enhancement",
            "description": f"Master the core technical prerequisites for {target_role}, focusing on missing fundamentals: {', '.join(missing_skills[:3]) if missing_skills else 'core tools'}.",
            "duration": "4 Weeks",
            "resources": ["Official Documentation", "Interactive Online Tutorials"]
        },
        {
            "step": 2,
            "title": "Hands-on Practical Implementation",
            "description": f"Build practical hands-on mini-projects incorporating {', '.join(missing_skills[3:5]) if len(missing_skills) > 3 else 'industry standard frameworks'}.",
            "duration": "6 Weeks",
            "resources": ["GitHub Repositories", "LeetCode / HackerRank"]
        },
        {
            "step": 3,
            "title": "End-to-End System Architecture",
            "description": "Develop a production-ready portfolio project featuring user auth, database persistence, REST/GraphQL APIs, and unit testing.",
            "duration": "6 Weeks",
            "resources": ["System Design Primer", "Udemy Advanced Courses"]
        },
        {
            "step": 4,
            "title": "DevOps & Cloud Deployment",
            "description": "Containerize your project using Docker and deploy to AWS / GCP / Vercel with automated CI/CD pipelines.",
            "duration": "3 Weeks",
            "resources": ["Docker Docs", "AWS Free Tier Workshops"]
        },
        {
            "step": 5,
            "title": "Interview Prep & Portfolio Review",
            "description": "Mock interview practice, resume optimization, and showcasing projects on GitHub and LinkedIn.",
            "duration": "3 Weeks",
            "resources": ["Cracking the Coding Interview", "Behavioral Interview Question Guides"]
        }
    ]
    return {
        "current_level": level,
        "target_role": target_role,
        "estimated_time": "5-7 Months",
        "steps": steps
    }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, Resume, CandidateLevel
from app.services.auth_service import get_current_user
import os, json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
router = APIRouter(prefix="/api/interview", tags=["interview"])

FALLBACK_QUESTIONS = {
    "Software Engineer": [
        {
            "question": "How would you design a thread-safe LRU Cache with O(1) time complexity for get and put operations?",
            "category": "technical",
            "difficulty": "hard",
            "tip": "Combine a Doubly Linked List for quick node removal/addition with a HashMap for O(1) key lookup. Use synchronization primitives for thread safety."
        },
        {
            "question": "Explain the differences between REST, gRPC, and GraphQL for service-to-service communication.",
            "category": "system_design",
            "difficulty": "medium",
            "tip": "Compare HTTP JSON payload overhead vs binary Protobuf serialization in gRPC and flexible query fetching in GraphQL."
        },
        {
            "question": "Describe a scenario where you identified and resolved a memory leak or CPU bottleneck in production.",
            "category": "behavioral",
            "difficulty": "medium",
            "tip": "Use the STAR method. Detail how you used profiling tools (pyspy, heap dumps, flame graphs) to pinpoint and fix the root cause."
        },
        {
            "question": "What is your strategy for writing maintainable unit and integration test suites with high code coverage?",
            "category": "technical",
            "difficulty": "easy",
            "tip": "Discuss the testing pyramid, mocking external boundaries (DB, APIs), test-driven development (TDD), and CI test automation."
        }
    ],
    "Backend Developer": [
        {
            "question": "How do you design a database schema and indexing strategy to optimize high-traffic SQL queries?",
            "category": "technical",
            "difficulty": "hard",
            "tip": "Discuss B-Tree vs Hash indexes, composite keys, avoiding SELECT *, and analyzing EXPLAIN ANALYZE execution plans."
        },
        {
            "question": "Explain how JWT authentication works in web applications and how you handle token expiration and revocation securely.",
            "category": "technical",
            "difficulty": "medium",
            "tip": "Highlight HMAC-SHA256 signatures, short-lived access tokens, refresh tokens stored in HttpOnly cookies, and token blocklists in Redis."
        },
        {
            "question": "How do you handle distributed transactions across microservices using the Saga Pattern?",
            "category": "system_design",
            "difficulty": "hard",
            "tip": "Explain choreography vs orchestration in Saga patterns and how compensating transactions revert partially completed steps upon failure."
        },
        {
            "question": "What algorithms or patterns would you use to build a distributed Rate Limiter for an API gateway?",
            "category": "system_design",
            "difficulty": "medium",
            "tip": "Compare Token Bucket, Leaky Bucket, and Fixed/Sliding Window Counter algorithms using Redis for central counter state."
        }
    ],
    "Frontend Developer": [
        {
            "question": "How do you optimize render performance and prevent unnecessary re-renders in complex React applications?",
            "category": "technical",
            "difficulty": "medium",
            "tip": "Mention React.memo, useMemo, useCallback, code-splitting with React.lazy, and avoiding inline object props inside render loops."
        },
        {
            "question": "Explain Core Web Vitals (LCP, FID/INP, CLS) and how you measure and improve them.",
            "category": "technical",
            "difficulty": "medium",
            "tip": "Discuss image compression/modern formats (WebP/AVIF), font display swap, avoiding layout shifts with explicit dimension attributes, and CDN caching."
        },
        {
            "question": "How do you manage global state in large-scale React apps (Context vs Redux Toolkit vs Zustand)?",
            "category": "technical",
            "difficulty": "easy",
            "tip": "Compare simple context boilerplate with centralized store state, atomic state updates, selector subscriptions, and devtools debugging."
        },
        {
            "question": "Describe how you implement accessible (a11y) dynamic UI components like modals and dropdowns.",
            "category": "behavioral",
            "difficulty": "easy",
            "tip": "Cover ARIA roles, focus trap management, keyboard navigation (Escape, Arrow keys, Tab), and screen reader accessibility."
        }
    ],
    "Full Stack Developer": [
        {
            "question": "Walk us through how you architect an end-to-end user authentication flow from React frontend to FastAPI backend.",
            "category": "system_design",
            "difficulty": "medium",
            "tip": "Detail HTTP-only secure cookie transport, CORS origin whitelisting, bearer headers, state persistence, and automatic token refresh interceptors."
        },
        {
            "question": "How do you approach database schema migrations in a live production app without downtime?",
            "category": "technical",
            "difficulty": "hard",
            "tip": "Explain multi-phase schema migrations: add column optional, deploy code that writes to both, backfill existing rows, update code to read new, drop old."
        },
        {
            "question": "Explain Server-Side Rendering (SSR) vs Static Site Generation (SSG) vs Client-Side Rendering (CSR).",
            "category": "technical",
            "difficulty": "medium",
            "tip": "Contrast SEO benefits and server load of SSR with pre-rendered SSG speed and dynamic interactive CSR single-page apps."
        }
    ],
    "ML Engineer": [
        {
            "question": "How do you detect and handle data drift and concept drift in deployed machine learning models?",
            "category": "technical",
            "difficulty": "hard",
            "tip": "Discuss statistical metrics (KS test, PSI), feature store monitoring, automated retraining pipelines, and shadow deployment validation."
        },
        {
            "question": "Explain the trade-offs between RAG (Retrieval-Augmented Generation) and Fine-Tuning for domain-specific LLM tasks.",
            "category": "system_design",
            "difficulty": "medium",
            "tip": "RAG is cost-effective and updates dynamically via vector search (FAISS/ChromaDB), while Fine-Tuning customizes tone and deep task style."
        },
        {
            "question": "How do you optimize deep learning model inference speed for real-time edge or API production deployment?",
            "category": "technical",
            "difficulty": "medium",
            "tip": "Mention model quantization (FP16/INT8), ONNX Runtime conversion, pruning unused weights, batching requests, and TensorRT acceleration."
        }
    ],
    "DevOps Engineer": [
        {
            "question": "Explain zero-downtime deployment strategies in Kubernetes (Rolling Updates vs Blue-Green vs Canary).",
            "category": "system_design",
            "difficulty": "hard",
            "tip": "Compare gradual container replacement with parallel blue-green cluster routing and traffic-weighted canary testing with Prometheus metrics."
        },
        {
            "question": "How do you secure secrets and sensitive environment variables in CI/CD pipelines and K8s clusters?",
            "category": "technical",
            "difficulty": "medium",
            "tip": "Discuss HashiCorp Vault, Kubernetes Secrets with encryption at rest, AWS Secrets Manager, and avoiding plain-text secrets in git repositories."
        },
        {
            "question": "How do you structure modular Infrastructure as Code using Terraform?",
            "category": "technical",
            "difficulty": "medium",
            "tip": "Cover remote state locking (S3 + DynamoDB), environment workspace isolation (dev/staging/prod), reusable modules, and terraform plan validation."
        }
    ]
}

@router.get("/questions")
def get_interview_questions(
    role: str = "Software Engineer",
    db: Session = Depends(get_db)
):
    target_role = role if role in FALLBACK_QUESTIONS else "Software Engineer"
    fallback_set = FALLBACK_QUESTIONS.get(target_role, FALLBACK_QUESTIONS["Software Engineer"])
    
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key.startswith("your-") or not client:
        return {"questions": fallback_set, "role": target_role, "level": "Intermediate", "source": "curated"}

    try:
        prompt = f"""Generate 6 practical, high-quality interview questions for a {target_role} position.
Include a mix of technical, system_design, and behavioral questions.

Return ONLY a valid JSON array matching this exact format:
[{{"question": "...", "category": "technical|behavioral|system_design", "difficulty": "easy|medium|hard", "tip": "..."}}]"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=1200
        )
        content = response.choices[0].message.content.strip()
        start, end = content.find("["), content.rfind("]") + 1
        questions = json.loads(content[start:end])
        return {"questions": questions, "role": target_role, "level": "Intermediate", "source": "ai"}
    except Exception as e:
        return {"questions": fallback_set, "role": target_role, "level": "Intermediate", "source": "curated"}

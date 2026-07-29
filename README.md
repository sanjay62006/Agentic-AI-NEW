# AI-Based Job Portal with Intelligent Career Agents

A production-ready AI-powered job portal with 8 intelligent agents for resume analysis, skill verification, job matching, and personalised career planning.

## Tech Stack
- **Backend**: Python FastAPI, SQLAlchemy, PostgreSQL, JWT Auth
- **Frontend**: React.js + Vite, React Router, Axios
- **AI**: OpenAI GPT-3.5-turbo for question generation, answer evaluation, roadmap generation
- **Resume Parsing**: PyPDF2 + keyword extraction

## 8 AI Agents
| Agent | Purpose |
|-------|---------|
| Resume Analyzer | Extracts skills, education, experience, projects |
| Resume Verification | Generates personalised questions from resume |
| Answer Evaluator | Scores answers on correctness, confidence, communication |
| Candidate Level | Classifies as Beginner / Intermediate / Advanced |
| Job Matching | Recommends jobs based on skills + level + score |
| Skill Gap | Identifies missing skills for target role |
| Career Roadmap | Creates step-by-step career plan |
| Learning Recommendation | Suggests courses, videos, certifications |

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Copy and configure environment
copy .env.example .env
# Edit .env with your DATABASE_URL and OPENAI_API_KEY

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database
Create a PostgreSQL database named `job_portal`. Tables are auto-created on first run via SQLAlchemy.

## Environment Variables
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_portal
SECRET_KEY=your-super-secret-key
OPENAI_API_KEY=sk-...
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/resume/upload | Upload PDF resume |
| GET | /api/resume/latest | Get latest resume |
| POST | /api/assessment/generate | Generate questions |
| POST | /api/assessment/submit | Submit answers |
| GET | /api/assessment/results | Get results |
| GET | /api/jobs/recommendations | Get job matches |
| GET | /api/career/skill-gap | Skill gap analysis |
| GET | /api/career/roadmap | Career roadmap |
| GET | /api/career/learning | Learning resources |
| GET | /api/interview/questions | Interview questions |

## User Flow
1. Register → Login
2. Upload Resume (PDF)
3. AI extracts skills, education, experience
4. Take AI Assessment (12 personalised questions)
5. AI evaluates answers → Overall score + level
6. View job recommendations
7. Analyse skill gaps for target role
8. Get personalised career roadmap
9. Access learning resources
10. Practice interview questions

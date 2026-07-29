-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes table
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    raw_text TEXT,
    skills JSONB,
    education JSONB,
    experience JSONB,
    projects JSONB,
    certifications JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table (one row per question)
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50),
    skill_tag VARCHAR(100),
    answer TEXT,
    score FLOAT,
    feedback TEXT,
    correctness FLOAT,
    confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate levels table
CREATE TABLE candidate_levels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    overall_score FLOAT,
    level VARCHAR(50),
    confidence FLOAT,
    skill_scores JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);

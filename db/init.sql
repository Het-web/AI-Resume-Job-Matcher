CREATE TABLE IF NOT EXISTS workflow_config (
    id integer PRIMARY KEY DEFAULT 1,

    digest_email text NOT NULL,

    city text,

    job_type text,

    search_terms text,

    pdf_url text NOT NULL,

    max_jobs_to_rerank integer DEFAULT 50,

    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    job_id text NOT NULL UNIQUE,

    source text NOT NULL,

    title text,
    company text,
    location text,
    work_type text,
    experience_required text,

    salary_min numeric,
    salary_max numeric,
    salary_raw text,
    salary_confidence text,

    description text,

    url text NOT NULL,

    date_posted timestamptz,

    compatibility_score integer,

    rerank_reasoning text,

    matching_skills jsonb,

    missing_skills jsonb,

    scored_at timestamptz,

    emailed boolean DEFAULT false,

    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_source_idx
ON jobs (source);

CREATE INDEX IF NOT EXISTS jobs_posted_idx
ON jobs (date_posted DESC);

CREATE INDEX IF NOT EXISTS jobs_score_idx
ON jobs (compatibility_score DESC);

CREATE INDEX IF NOT EXISTS jobs_emailed_idx
ON jobs (emailed);

CREATE TABLE IF NOT EXISTS job_score_errors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,

    source text DEFAULT 'groq',

    raw_response text,

    error_message text,

    created_at timestamptz DEFAULT now()
);


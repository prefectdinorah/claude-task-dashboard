-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT slug_length CHECK (char_length(slug) >= 3 AND char_length(slug) <= 100)
);

-- Tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  active_form TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  position INTEGER DEFAULT 0,

  -- Unique constraint per project
  CONSTRAINT unique_task_per_project UNIQUE (id, project_id)
);

-- Indexes for performance
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_position ON tasks(project_id, status, position);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

-- Trigger function for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access without authentication)
CREATE POLICY "Public read access to projects"
  ON projects
  FOR SELECT
  USING (true);

CREATE POLICY "Public create access to projects"
  ON projects
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to projects"
  ON projects
  FOR UPDATE
  USING (true);

CREATE POLICY "Public read access to tasks"
  ON tasks
  FOR SELECT
  USING (true);

CREATE POLICY "Public create access to tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to tasks"
  ON tasks
  FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access to tasks"
  ON tasks
  FOR DELETE
  USING (true);

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

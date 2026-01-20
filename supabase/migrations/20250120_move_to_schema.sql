-- Move tables to task_dashboard schema
-- This migration creates a new schema and moves all tables there

-- Step 1: Create the new schema
CREATE SCHEMA IF NOT EXISTS task_dashboard;

-- Step 2: Move tables to the new schema (only if they exist in public)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    ALTER TABLE public.projects SET SCHEMA task_dashboard;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    ALTER TABLE public.tasks SET SCHEMA task_dashboard;
  END IF;
END $$;

-- Step 3: Grant necessary permissions
GRANT USAGE ON SCHEMA task_dashboard TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA task_dashboard TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA task_dashboard TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA task_dashboard TO anon, authenticated, service_role;

-- Step 4: Update function schema (only if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
             WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column') THEN
    ALTER FUNCTION public.update_updated_at_column() SET SCHEMA task_dashboard;
  END IF;
END $$;

-- Step 5: Re-enable Realtime for moved tables
DO $$
BEGIN
  -- Try to remove from public (ignore errors if doesn't exist)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.projects;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.tasks;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Add to new schema (only if not already added)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE task_dashboard.projects;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE task_dashboard.tasks;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Step 6: Update default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA task_dashboard
  GRANT ALL ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA task_dashboard
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA task_dashboard
  GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Note: RLS policies and triggers are automatically moved with the tables
-- No need to recreate them

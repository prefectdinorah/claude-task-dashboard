export type TaskStatus = 'pending' | 'in_progress' | 'completed'

// Supabase Task type (from database)
export interface Task {
  id: string
  project_id: string
  content: string
  status: TaskStatus
  active_form: string
  tags: string[]
  created_at: string
  updated_at: string
  position: number
}

// Supabase Project type (from database)
export interface Project {
  id: string
  slug: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  last_sync_at?: string
}

// Legacy format for webhook compatibility (Claude Code tasks.json)
export interface TasksData {
  project: string
  lastUpdated: string
  tasks: {
    id: string
    content: string
    status: TaskStatus
    activeForm: string
    createdAt: string
    updatedAt: string
    tags?: string[]
  }[]
}

export const STATUS_CONFIG = {
  pending: {
    label: 'To Do',
    color: 'status-todo',
    icon: 'Circle',
  },
  in_progress: {
    label: 'In Progress',
    color: 'status-progress',
    icon: 'Clock',
  },
  completed: {
    label: 'Done',
    color: 'status-done',
    icon: 'CheckCircle',
  },
} as const

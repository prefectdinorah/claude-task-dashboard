export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Task {
  id: string
  content: string
  status: TaskStatus
  activeForm: string
  createdAt: string
  updatedAt: string
  project?: string
  tags?: string[]
}

export interface TasksData {
  project: string
  lastUpdated: string
  tasks: Task[]
}

export interface WSMessage {
  type: 'init' | 'update' | 'ping' | 'pong'
  data?: TasksData
  timestamp: string
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

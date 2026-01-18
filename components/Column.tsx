'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { Circle, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/lib/types'

const columnConfig: Record<TaskStatus, {
  title: string
  icon: React.ElementType
  color: string
  bgColor: string
}> = {
  pending: {
    title: 'To Do',
    icon: Circle,
    color: 'text-status-todo',
    bgColor: 'bg-status-todo/10',
  },
  in_progress: {
    title: 'In Progress',
    icon: Clock,
    color: 'text-status-progress',
    bgColor: 'bg-status-progress/10',
  },
  completed: {
    title: 'Done',
    icon: CheckCircle2,
    color: 'text-status-done',
    bgColor: 'bg-status-done/10',
  },
}

interface ColumnProps {
  status: TaskStatus
  tasks: Task[]
}

export function Column({ status, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const { title, icon: Icon, color, bgColor } = columnConfig[status]

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок колонки */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className={cn('p-1.5 rounded-md', bgColor)}>
          <Icon size={16} className={color} />
        </div>
        <h2 className="font-semibold text-text-primary">{title}</h2>
        <span className={cn(
          'ml-auto px-2 py-0.5 rounded-full text-xs font-medium',
          bgColor,
          color
        )}>
          {tasks.length}
        </span>
      </div>

      {/* Список задач (drop zone) */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-3 overflow-y-auto pr-1 p-2 -m-2 rounded-lg transition-colors',
          isOver && 'bg-accent-purple/5 ring-2 ring-accent-purple/20 ring-inset'
        )}
      >
        <AnimatePresence mode="popLayout">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                'flex items-center justify-center h-32 border border-dashed rounded-lg transition-colors',
                isOver ? 'border-accent-purple/50 bg-accent-purple/5' : 'border-border'
              )}
            >
              <p className="text-sm text-text-tertiary">
                {isOver ? 'Отпустите здесь' : 'Нет задач'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

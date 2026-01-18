'use client'

import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Circle, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { cn, formatTime } from '@/lib/utils'
import type { Task, TaskStatus } from '@/lib/types'

const statusConfig: Record<TaskStatus, { icon: React.ElementType; color: string }> = {
  pending: { icon: Circle, color: 'text-status-todo' },
  in_progress: { icon: Loader2, color: 'text-status-progress' },
  completed: { icon: CheckCircle2, color: 'text-status-done' },
}

interface TaskCardProps {
  task: Task
  index: number
  isDragging?: boolean
}

export function TaskCard({ task, index, isDragging: isDraggingProp }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const { icon: StatusIcon, color } = statusConfig[task.status]
  const isActive = task.status === 'in_progress'
  const dragging = isDraggingProp || isDragging

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      layout={!dragging}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: dragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'group relative p-4 rounded-lg border transition-all duration-200 cursor-grab active:cursor-grabbing',
        'bg-surface hover:bg-surface-hover',
        isActive
          ? 'border-status-progress/50 shadow-lg shadow-status-progress/10'
          : 'border-border hover:border-border-hover',
        dragging && 'shadow-xl ring-2 ring-accent-purple/50 z-50'
      )}
    >
      {/* Индикатор активности */}
      {isActive && (
        <div className="absolute -left-px top-4 bottom-4 w-0.5 bg-status-progress rounded-full" />
      )}

      <div className="flex items-start gap-3">
        {/* Иконка статуса */}
        <div className={cn('mt-0.5 flex-shrink-0', color)}>
          <StatusIcon
            size={18}
            className={isActive ? 'animate-spin' : ''}
          />
        </div>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          {/* Активная форма (что делается сейчас) */}
          {isActive && task.activeForm && (
            <p className="text-sm text-status-progress font-medium mb-1">
              {task.activeForm}
            </p>
          )}

          {/* Основной текст задачи */}
          <p className={cn(
            'text-sm leading-relaxed',
            task.status === 'completed'
              ? 'text-text-tertiary line-through'
              : 'text-text-primary'
          )}>
            {task.content}
          </p>

          {/* Метаданные */}
          <div className="flex items-center gap-3 mt-2">
            {task.updatedAt && (
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <Clock size={12} />
                {formatTime(task.updatedAt)}
              </span>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 text-xs bg-surface-active rounded text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/lib/types'

const COLUMNS: TaskStatus[] = ['pending', 'in_progress', 'completed']

interface BoardProps {
  tasks: Task[]
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => void
}

export function Board({ tasks, onTaskMove }: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      in_progress: [],
      completed: [],
    }

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })

    return grouped
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    // Проверяем что это валидный статус
    if (!COLUMNS.includes(newStatus)) return

    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus && onTaskMove) {
      onTaskMove(taskId, newStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]"
      >
        {COLUMNS.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
          />
        ))}
      </motion.div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105">
            <TaskCard task={activeTask} index={0} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

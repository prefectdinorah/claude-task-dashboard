'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function useRealtimeTasks(projectId: string, initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isConnected, setIsConnected] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'task_dashboard',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [...prev, payload.new as Task])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === payload.new.id ? (payload.new as Task) : task
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, supabase])

  // Move task function with optimistic update
  async function moveTask(taskId: string, newStatus: string) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus as Task['status'], updated_at: new Date().toISOString() }
          : task
      )
    )

    // API call
    try {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus, projectId }),
      })

      if (!response.ok) {
        throw new Error('Failed to move task')
      }
    } catch (error) {
      console.error('Move task error:', error)
      // Rollback on error
      setTasks(initialTasks)
    }
  }

  return { tasks, isConnected, moveTask }
}

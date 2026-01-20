'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRealtimeTasks } from '@/hooks/useRealtimeTasks'
import { Header } from '@/components/Header'
import { Toolbar } from '@/components/Toolbar'
import { Board } from '@/components/Board'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task, TaskStatus, Project } from '@/lib/types'

interface DashboardClientProps {
  project: Project
  initialTasks: Task[]
}

export function DashboardClient({ project, initialTasks }: DashboardClientProps) {
  const { tasks, isConnected, moveTask } = useRealtimeTasks(project.id, initialTasks)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }, [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesContent = task.content.toLowerCase().includes(searchLower)
        const matchesActiveForm = task.active_form?.toLowerCase().includes(searchLower)
        if (!matchesContent && !matchesActiveForm) {
          return false
        }
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const taskTags = task.tags || []
        const hasMatchingTag = selectedTags.some((tag) => taskTags.includes(tag))
        if (!hasMatchingTag) {
          return false
        }
      }

      return true
    })
  }, [tasks, search, selectedTags])

  // Handle task move
  const handleTaskMove = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      await moveTask(taskId, newStatus)
    },
    [moveTask]
  )

  // Toggle tag
  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }, [])

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearch('')
    setSelectedTags([])
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        projectName={project.name}
        isConnected={isConnected}
        lastUpdate={project.last_sync_at ? new Date(project.last_sync_at) : null}
        taskCount={tasks.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {tasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] gap-4"
            >
              <div className="p-4 rounded-full bg-surface">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-text-tertiary"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 12h6M9 16h6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                No tasks yet
              </h2>
              <p className="text-text-secondary text-center max-w-md">
                Tasks will appear here when you send a webhook from Claude Code
              </p>
              <div className="mt-4 p-4 bg-surface border border-border rounded-lg text-sm text-text-tertiary max-w-lg">
                <p className="font-medium text-text-secondary mb-2">Webhook URL:</p>
                <code className="block bg-background p-2 rounded text-xs break-all">
                  {process.env.NEXT_PUBLIC_APP_URL}/api/webhook/{project.slug}
                </code>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Toolbar
                search={search}
                onSearchChange={setSearch}
                allTags={allTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClearFilters={handleClearFilters}
                filteredCount={filteredTasks.length}
                totalCount={tasks.length}
              />
              <Board tasks={filteredTasks} onTaskMove={handleTaskMove} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer with status */}
      <footer className="border-t border-border py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-text-tertiary">
          <span>Task Dashboard v2.0 (Supabase)</span>
          <span className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-status-done' : 'bg-accent-red'
              }`}
            />
            Realtime: {isConnected ? 'connected' : 'disconnected'}
          </span>
        </div>
      </footer>
    </div>
  )
}

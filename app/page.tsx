'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Header } from '@/components/Header'
import { Toolbar } from '@/components/Toolbar'
import { Board } from '@/components/Board'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task, TaskStatus } from '@/lib/types'

export default function Home() {
  const { data, isConnected, lastUpdate, moveTask } = useWebSocket()
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Синхронизация с WebSocket данными
  useEffect(() => {
    if (data?.tasks) {
      setTasks(data.tasks)
    }
  }, [data])

  // Собираем все уникальные теги
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }, [tasks])

  // Фильтрация задач
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Фильтр по поиску
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesContent = task.content.toLowerCase().includes(searchLower)
        const matchesActiveForm = task.activeForm?.toLowerCase().includes(searchLower)
        if (!matchesContent && !matchesActiveForm) {
          return false
        }
      }

      // Фильтр по тегам
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

  // Обработчик перемещения задачи
  const handleTaskMove = useCallback((taskId: string, newStatus: TaskStatus) => {
    // Оптимистичное обновление UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    )

    // Отправляем изменения на сервер
    moveTask(taskId, newStatus)
  }, [moveTask])

  // Переключение тега
  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }, [])

  // Сброс фильтров
  const handleClearFilters = useCallback(() => {
    setSearch('')
    setSelectedTags([])
  }, [])

  const projectName = data?.project || 'Task Dashboard'

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        projectName={projectName}
        isConnected={isConnected}
        lastUpdate={lastUpdate}
        taskCount={tasks.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] gap-4"
            >
              <Loader2 size={40} className="text-accent-purple animate-spin" />
              <p className="text-text-secondary">
                {isConnected ? 'Загрузка задач...' : 'Подключение к серверу...'}
              </p>
              {!isConnected && (
                <p className="text-sm text-text-tertiary">
                  Убедитесь, что WebSocket сервер запущен на порту 3051
                </p>
              )}
            </motion.div>
          ) : tasks.length === 0 ? (
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
                Нет активных задач
              </h2>
              <p className="text-text-secondary text-center max-w-md">
                Задачи появятся здесь автоматически, когда Claude Code начнёт
                работу над проектом
              </p>
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

      {/* Футер со статусом */}
      <footer className="border-t border-border py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-text-tertiary">
          <span>Task Dashboard v1.0</span>
          <span className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-status-done' : 'bg-accent-red'}`} />
            WebSocket: {isConnected ? 'connected' : 'disconnected'}
          </span>
        </div>
      </footer>
    </div>
  )
}

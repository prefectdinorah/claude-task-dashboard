'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, Clock, Plus } from 'lucide-react'
import type { Project } from '@/lib/types'

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Load projects
  useEffect(() => {
    loadProjects()
  }, [search])

  async function loadProjects() {
    setLoadingProjects(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const response = await fetch(`/api/projects?${params}`)
      const data = await response.json()

      if (data.success) {
        setProjects(data.projects)
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/${data.project.slug}`)
      } else {
        setError(data.error || 'Failed to create project')
      }
    } catch (err) {
      setError('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date: string) {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-surface to-surface-hover">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-purple/10 mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent-purple"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Task Dashboard
          </h1>
          <p className="text-text-secondary">
            Real-time Kanban dashboard for Claude Code tasks
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('select')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'select'
                ? 'text-accent-purple'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Select Project
            {activeTab === 'select' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-purple" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'create'
                ? 'text-accent-purple'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Create New
            {activeTab === 'create' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-purple" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'select' ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent text-text-primary placeholder-text-tertiary"
              />
            </div>

            {/* Projects List */}
            <div className="bg-surface border border-border rounded-lg divide-y divide-border max-h-[500px] overflow-y-auto">
              {loadingProjects ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-accent-purple" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-hover mb-3">
                    <Plus size={24} className="text-text-tertiary" />
                  </div>
                  <p className="text-text-secondary mb-1">No projects found</p>
                  <p className="text-sm text-text-tertiary">
                    Create your first project to get started
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 px-4 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded text-sm font-medium transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => router.push(`/${project.slug}`)}
                    className="w-full text-left px-6 py-4 hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-primary group-hover:text-accent-purple transition-colors truncate">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-text-tertiary mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-text-tertiary">
                          <Clock size={12} />
                          <span>
                            {project.last_sync_at
                              ? `Updated ${formatDate(project.last_sync_at)}`
                              : `Created ${formatDate(project.created_at)}`}
                          </span>
                        </div>
                      </div>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-text-tertiary group-hover:text-accent-purple transition-colors flex-shrink-0"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 bg-surface p-6 rounded-lg border border-border shadow-lg">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Project Name <span className="text-accent-red">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Project"
                required
                minLength={3}
                maxLength={100}
                className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent text-text-primary placeholder-text-tertiary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent text-text-primary placeholder-text-tertiary resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded text-accent-red text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || name.length < 3}
              className="w-full bg-accent-purple hover:bg-accent-purple/90 disabled:bg-accent-purple/50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Dashboard'
              )}
            </button>
          </form>
        )}

        {/* Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-text-tertiary">
            After creating, you'll get a unique URL to use with Claude Code webhook
          </p>
          <p className="text-xs text-text-tertiary">
            No registration required • Public dashboard • Real-time sync
          </p>
        </div>
      </div>
    </div>
  )
}

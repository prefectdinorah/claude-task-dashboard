'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LandingPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-surface to-surface-hover">
      <div className="max-w-md w-full space-y-8">
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

        {/* Form */}
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

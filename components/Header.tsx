'use client'

import { motion } from 'framer-motion'
import { Activity, Wifi, WifiOff, Clock } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface HeaderProps {
  projectName: string
  isConnected: boolean
  lastUpdate: Date | null
  taskCount: number
}

export function Header({ projectName, isConnected, lastUpdate, taskCount }: HeaderProps) {
  return (
    <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Лого и название */}
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-2 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue"
            >
              <Activity size={24} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                {projectName || 'Task Dashboard'}
              </h1>
              <p className="text-sm text-text-tertiary">
                Real-time task monitoring
              </p>
            </div>
          </div>

          {/* Статус подключения */}
          <div className="flex items-center gap-6">
            {/* Счётчик задач */}
            <div className="text-sm text-text-secondary">
              <span className="font-mono text-lg text-text-primary">{taskCount}</span>
              {' '}задач
            </div>

            {/* Последнее обновление */}
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <Clock size={14} />
                {formatDate(lastUpdate)}
              </div>
            )}

            {/* Индикатор соединения */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
              isConnected
                ? 'bg-status-done/10 text-status-done'
                : 'bg-accent-red/10 text-accent-red'
            )}>
              {isConnected ? (
                <>
                  <Wifi size={14} />
                  <span>Connected</span>
                  <span className="w-2 h-2 rounded-full bg-status-done animate-pulse" />
                </>
              ) : (
                <>
                  <WifiOff size={14} />
                  <span>Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

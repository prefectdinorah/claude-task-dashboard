'use client'

import { Search, Tag, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  allTags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
  filteredCount: number
  totalCount: number
}

export function Toolbar({
  search,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  onClearFilters,
  filteredCount,
  totalCount,
}: ToolbarProps) {
  const hasFilters = search.length > 0 || selectedTags.length > 0

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Поиск и счётчик */}
      <div className="flex items-center gap-4">
        {/* Поле поиска */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Поиск задач..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'w-full pl-9 pr-4 py-2 rounded-lg text-sm',
              'bg-surface border border-border',
              'text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50',
              'transition-all'
            )}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Счётчик результатов */}
        {hasFilters && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              Найдено: <span className="text-text-primary font-medium">{filteredCount}</span>
              <span className="text-text-tertiary"> из {totalCount}</span>
            </span>
            <button
              onClick={onClearFilters}
              className="text-xs text-accent-purple hover:text-accent-purple/80 transition-colors"
            >
              Сбросить
            </button>
          </div>
        )}
      </div>

      {/* Фильтр по тегам */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-text-tertiary mr-1">
            <Tag size={14} />
            <span className="text-xs">Теги:</span>
          </div>
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                  isSelected
                    ? 'bg-accent-purple text-white'
                    : 'bg-surface-active text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

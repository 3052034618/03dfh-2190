import { useState } from 'react'
import { Plus, Download, CalendarDays, LayoutGrid } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import { getWeekDateRange } from '@/utils/helpers'

interface ToolbarProps {
  onNewSession: () => void
  onNewPlayer: () => void
  onExport: () => void
}

export default function Toolbar({ onNewSession, onNewPlayer, onExport }: ToolbarProps) {
  const sessions = useScheduleStore((s) => s.sessions)
  const players = useScheduleStore((s) => s.players)
  const weekRange = getWeekDateRange()

  return (
    <div className="h-14 bg-board-surface border-b border-board-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-board-accent" />
          <h1 className="text-base font-semibold text-board-text tracking-tight">约本排期板</h1>
        </div>
        <div className="h-5 w-px bg-board-border" />
        <div className="flex items-center gap-1.5 text-sm text-board-muted">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{weekRange}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-board-muted ml-2">
          <span>{sessions.length} 个车局</span>
          <span>{players.length} 位玩家</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewPlayer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-board-muted hover:text-board-text hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加玩家
        </button>
        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-white bg-board-text hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建车局
        </button>
        {sessions.length > 0 && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-board-muted hover:text-board-text hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出约本图
          </button>
        )}
      </div>
    </div>
  )
}

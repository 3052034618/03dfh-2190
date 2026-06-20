import { Plus } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import SessionCard from './SessionCard'
import type { Session, Hint } from '@/types'

interface SessionPanelProps {
  onNewSession: () => void
  onEditSession: (session: Session) => void
  sessionHints: Record<string, Hint[]>
  onRemovePlayer: (slotId: string) => void
  onPlayerClick: (playerId: string) => void
  onSlotHover: (slotId: string | null) => void
  hoveredSlotId: string | null
}

export default function SessionPanel({
  onNewSession,
  onEditSession,
  sessionHints,
  onRemovePlayer,
  onPlayerClick,
  onSlotHover,
  hoveredSlotId,
}: SessionPanelProps) {
  const sessions = useScheduleStore((s) => s.sessions)
  const currentWeekKey = useScheduleStore((s) => s.currentWeekKey)
  const weekSessions = sessions.filter((s) => s.weekKey === currentWeekKey)

  const hoveredSessionId = hoveredSlotId
    ? weekSessions.find((ses) =>
        useScheduleStore.getState().sessionSlots.find((sl) => sl.id === hoveredSlotId)?.sessionId === ses.id
      )?.id
    : null

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-board-border shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-board-text uppercase tracking-wider">本周车局</h2>
          <button
            onClick={onNewSession}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-board-muted hover:text-board-text hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-3 h-3" />
            新建
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {weekSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onEdit={() => onEditSession(session)}
            hints={sessionHints[session.id] || []}
            onRemovePlayer={onRemovePlayer}
            onPlayerClick={onPlayerClick}
            onSlotHover={onSlotHover}
            hoveredSlotId={hoveredSessionId === session.id ? hoveredSlotId : null}
          />
        ))}

        {weekSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-xl">📋</span>
            </div>
            <p className="text-sm text-board-muted mb-1">本周还没有车局</p>
            <p className="text-xs text-gray-400">点击上方「新建」创建你的第一个车局</p>
          </div>
        )}
      </div>
    </div>
  )
}

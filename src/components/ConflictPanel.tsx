import { AlertTriangle, Lightbulb, Info, Users, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useScheduleStore } from '@/store/scheduleStore'
import type { Session, Hint } from '@/types'
import { getHintColor } from '@/utils/helpers'

interface ConflictPanelProps {
  onLocateSession: (sessionId: string, playerId?: string, slotId?: string) => void
  onEditPlayer: (playerId: string) => void
}

function getHintIcon(type: Hint['type']) {
  switch (type) {
    case 'conflict': return <AlertTriangle className="w-3.5 h-3.5" />
    case 'suggestion': return <Lightbulb className="w-3.5 h-3.5" />
    case 'info': return <Info className="w-3.5 h-3.5" />
  }
}

export default function ConflictPanel({ onLocateSession, onEditPlayer }: ConflictPanelProps) {
  const sessions = useScheduleStore((s) => s.sessions)
  const getAllSessionHints = useScheduleStore((s) => s.getAllSessionHints)
  const getPlayerById = useScheduleStore((s) => s.getPlayerById)
  const currentWeekKey = useScheduleStore((s) => s.currentWeekKey)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  const weekSessions = sessions.filter((s) => s.weekKey === currentWeekKey)

  const sessionsWithHints: { session: Session; hints: Hint[]; conflictCount: number }[] = weekSessions
    .map((session) => {
      const hints = getAllSessionHints(session.id)
      const conflictCount = hints.filter((h) => h.type === 'conflict').length
      return { session, hints, conflictCount }
    })
    .sort((a, b) => b.conflictCount - a.conflictCount)

  const totalConflicts = sessionsWithHints.reduce((sum, s) => sum + s.conflictCount, 0)
  const totalSuggestions = sessionsWithHints.reduce(
    (sum, s) => sum + s.hints.filter((h) => h.type === 'suggestion').length,
    0
  )

  const toggleExpand = (id: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleHintClick = (sessionId: string, hint: Hint) => {
    onLocateSession(sessionId, hint.targetPlayerId, hint.targetSlotId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-board-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-board-text uppercase tracking-wider">冲突汇总</h2>
          <div className="flex items-center gap-1.5">
            {totalConflicts > 0 && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-medium">
                <AlertTriangle className="w-2.5 h-2.5" />
                {totalConflicts}
              </span>
            )}
            {totalSuggestions > 0 && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium">
                <Lightbulb className="w-2.5 h-2.5" />
                {totalSuggestions}
              </span>
            )}
          </div>
        </div>
        <p className="text-[10px] text-board-muted">
          智能检测车局时间、机制位、熬夜等潜在问题
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sessionsWithHints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-xl">✨</span>
            </div>
            <p className="text-sm text-board-muted mb-1">还没有车局</p>
            <p className="text-xs text-gray-400">先创建车局和玩家吧</p>
          </div>
        )}

        {sessionsWithHints.length > 0 && totalConflicts === 0 && totalSuggestions === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <span className="text-xl">✅</span>
            </div>
            <p className="text-sm text-board-success font-medium mb-1">一切正常</p>
            <p className="text-xs text-gray-400">当前车局没有发现冲突问题</p>
          </div>
        )}

        {sessionsWithHints.map(({ session, hints }) => {
          const isExpanded = expandedSessions.has(session.id)
          const hasHints = hints.length > 0
          if (!hasHints) return null

          return (
            <div
              key={session.id}
              className="bg-board-surface rounded-lg border border-board-border overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(session.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-board-muted shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-board-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-board-text truncate">
                    {session.scriptName}
                  </div>
                  <div className="text-[10px] text-board-muted truncate">
                    {session.shopName} · {session.dmName}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-medium">
                    {hints.filter((h) => h.type === 'conflict').length} 冲突
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-board-border px-3 py-2 space-y-1.5 bg-gray-50/50">
                  {hints.map((hint, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleHintClick(session.id, hint)}
                      className={`w-full flex items-start gap-2 px-2 py-1.5 rounded text-left text-[11px] transition-colors hover:bg-white ${getHintColor(hint.type)}`}
                    >
                      <span className="mt-0.5 shrink-0">{getHintIcon(hint.type)}</span>
                      <span className="flex-1">{hint.message}</span>
                      {hint.targetPlayerId && (
                        <span className="shrink-0 text-[9px] opacity-70">
                          {getPlayerById(hint.targetPlayerId)?.nickname}
                        </span>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => onLocateSession(session.id)}
                    className="w-full flex items-center justify-center gap-1 mt-1 py-1.5 text-[10px] text-board-info hover:underline"
                  >
                    <Users className="w-3 h-3" />
                    跳转到车局
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

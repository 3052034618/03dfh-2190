import { Plus, X, Filter } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import SessionCard from './SessionCard'
import type { Session, Hint } from '@/types'
import { SCRIPT_TYPES } from '@/types'

export interface SessionFilter {
  shop: string | null
  dm: string | null
  types: string[]
}

interface SessionPanelProps {
  onNewSession: () => void
  onEditSession: (session: Session) => void
  sessionHints: Record<string, Hint[]>
  onRemovePlayer: (slotId: string) => void
  onPlayerClick: (playerId: string) => void
  onSlotHover: (slotId: string | null) => void
  hoveredSlotId: string | null
  filter: SessionFilter
  onFilterChange: (filter: SessionFilter) => void
  highlightSessionId?: string | null
}

export default function SessionPanel({
  onNewSession,
  onEditSession,
  sessionHints,
  onRemovePlayer,
  onPlayerClick,
  onSlotHover,
  hoveredSlotId,
  filter,
  onFilterChange,
  highlightSessionId,
}: SessionPanelProps) {
  const sessions = useScheduleStore((s) => s.sessions)
  const getShops = useScheduleStore((s) => s.getShops)
  const getDMs = useScheduleStore((s) => s.getDMs)
  const currentWeekKey = useScheduleStore((s) => s.currentWeekKey)
  const shops = getShops()
  const dms = getDMs()

  const weekSessions = sessions.filter((s) => s.weekKey === currentWeekKey)
  const filteredSessions = weekSessions.filter((s) => {
    if (filter.shop && s.shopName !== filter.shop) return false
    if (filter.dm && s.dmName !== filter.dm) return false
    if (filter.types.length > 0 && !filter.types.some((t) => s.scriptTypes.includes(t))) return false
    return true
  })

  const hasAnyFilter = !!filter.shop || !!filter.dm || filter.types.length > 0

  const hoveredSessionId = hoveredSlotId
    ? filteredSessions.find((ses) =>
        useScheduleStore.getState().sessionSlots.find((sl) => sl.id === hoveredSlotId)?.sessionId === ses.id
      )?.id
    : null

  const toggleType = (t: string) => {
    const types = filter.types.includes(t)
      ? filter.types.filter((x) => x !== t)
      : [...filter.types, t]
    onFilterChange({ ...filter, types })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-board-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-board-text uppercase tracking-wider">本周车局</h2>
            {hasAnyFilter && (
              <span className="px-1.5 py-0.5 rounded bg-board-accent/10 text-board-accent text-[10px] font-medium">
                筛选中
              </span>
            )}
          </div>
          <button
            onClick={onNewSession}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-board-muted hover:text-board-text hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-3 h-3" />
            新建
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex gap-1.5">
            <select
              value={filter.shop || ''}
              onChange={(e) => onFilterChange({ ...filter, shop: e.target.value || null })}
              className="flex-1 px-2 py-1 rounded-md border border-board-border text-[11px] text-board-text bg-white focus:outline-none focus:ring-1 focus:ring-board-accent/30"
            >
              <option value="">全部店铺</option>
              {shops.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filter.dm || ''}
              onChange={(e) => onFilterChange({ ...filter, dm: e.target.value || null })}
              className="flex-1 px-2 py-1 rounded-md border border-board-border text-[11px] text-board-text bg-white focus:outline-none focus:ring-1 focus:ring-board-accent/30"
            >
              <option value="">全部DM</option>
              {dms.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {filter.types.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {filter.types.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-board-text text-white text-[10px] font-medium"
                >
                  {t}
                  <X className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {SCRIPT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  filter.types.includes(t)
                    ? 'bg-board-accent text-white'
                    : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {hasAnyFilter && (
            <button
              onClick={() => onFilterChange({ shop: null, dm: null, types: [] })}
              className="text-[10px] text-board-muted hover:text-board-text flex items-center gap-0.5"
            >
              <Filter className="w-2.5 h-2.5" />
              清除筛选
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredSessions.map((session) => (
          <div key={session.id} id={`session-${session.id}`}>
            <SessionCard
              session={session}
              onEdit={() => onEditSession(session)}
              hints={sessionHints[session.id] || []}
              onRemovePlayer={onRemovePlayer}
              onPlayerClick={onPlayerClick}
              onSlotHover={onSlotHover}
              hoveredSlotId={hoveredSessionId === session.id ? hoveredSlotId : null}
              isHighlighted={highlightSessionId === session.id}
            />
          </div>
        ))}

        {filteredSessions.length === 0 && weekSessions.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Filter className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-board-muted mb-1">没有符合筛选的车局</p>
            <button
              onClick={() => onFilterChange({ shop: null, dm: null, types: [] })}
              className="text-xs text-board-info hover:underline"
            >
              清除筛选条件
            </button>
          </div>
        )}

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

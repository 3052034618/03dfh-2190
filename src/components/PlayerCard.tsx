import { useDraggable } from '@dnd-kit/core'
import { Moon, Drama, Clock, AlertTriangle } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import type { Player } from '@/types'

interface PlayerCardProps {
  player: Player
  onEdit: () => void
  isAssigned: boolean
}

export default function PlayerCard({ player, onEdit, isAssigned }: PlayerCardProps) {
  const getRecentPlays = useScheduleStore((s) => s.getRecentPlays)
  const getPlayerStats = useScheduleStore((s) => s.getPlayerStats)
  const recentPlays = getRecentPlays(player.id, 3)
  const stats = getPlayerStats(player.id)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
    data: { type: 'player' as const, playerId: player.id },
    disabled: isAssigned,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined

  const prefColorMap: Record<string, string> = {
    '情感': 'bg-pink-100 text-pink-700',
    '硬核': 'bg-purple-100 text-purple-700',
    '机制': 'bg-amber-100 text-amber-700',
    '恐怖': 'bg-gray-800 text-gray-100',
    '欢乐': 'bg-yellow-100 text-yellow-700',
    '阵营': 'bg-red-100 text-red-700',
    '推理': 'bg-blue-100 text-blue-700',
    '沉浸': 'bg-teal-100 text-teal-700',
    '其他': 'bg-gray-100 text-gray-600',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation()
        onEdit()
      }}
      className={`
        relative bg-board-surface rounded-xl border border-board-border p-3 cursor-pointer select-none
        card-hover group
        ${isDragging ? 'player-card-dragging' : ''}
        ${isAssigned ? 'opacity-40 cursor-default' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-semibold text-board-text leading-tight">{player.nickname}</span>
        <div className="flex items-center gap-1">
          {player.canStayUp && (
            <span title="能熬夜" className="text-indigo-400">
              <Moon className="w-3.5 h-3.5" />
            </span>
          )}
          {player.acceptCrossGender && (
            <span title="可反串" className="text-violet-400">
              <Drama className="w-3.5 h-3.5" />
            </span>
          )}
          {player.lateNote && (
            <span title={player.lateNote} className="text-board-danger">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {player.preferenceTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {player.preferenceTypes.map((type) => (
            <span
              key={type}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${prefColorMap[type] || prefColorMap['其他']}`}
            >
              {type}
            </span>
          ))}
        </div>
      )}

      {recentPlays.length > 0 && (
        <div className="space-y-0.5">
          {recentPlays.map((r) => (
            <div key={r.id} className="text-[10px] text-board-muted truncate">
              {r.scriptName}{r.shopName ? ` · ${r.shopName}` : ''}
            </div>
          ))}
        </div>
      )}

      {player.lateNote && (
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-board-danger">
          <Clock className="w-3 h-3 shrink-0" />
          <span className="truncate">{player.lateNote}</span>
        </div>
      )}

      {stats.totalSessions > 0 && (
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {stats.noShowCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-medium">
              爽约{stats.noShowCount}次
            </span>
          )}
          {stats.avgLateMinutes >= 10 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[9px] font-medium">
              均迟{stats.avgLateMinutes}分
            </span>
          )}
          {stats.onTimeCount > 0 && stats.noShowCount === 0 && stats.avgLateMinutes < 10 && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-medium">
              准时靠谱
            </span>
          )}
        </div>
      )}

      {isAssigned && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60">
          <span className="text-xs text-board-muted font-medium">已入局</span>
        </div>
      )}
    </div>
  )
}

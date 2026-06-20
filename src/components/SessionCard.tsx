import { Pencil, Trash2, Clock, MapPin, User, Users, CreditCard, ClipboardList, CheckCircle2, XCircle } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { useScheduleStore } from '@/store/scheduleStore'
import type { Session, Hint } from '@/types'
import { DEPOSIT_STATUS_LABELS, GENDER_LABELS, SESSION_STATUS_LABELS } from '@/types'
import { getHintIcon, getHintColor } from '@/utils/helpers'

interface SessionCardProps {
  session: Session
  onEdit: () => void
  onDebrief: () => void
  hints: Hint[]
  onRemovePlayer: (slotId: string) => void
  onPlayerClick: (playerId: string) => void
  onSlotHover: (slotId: string | null) => void
  hoveredSlotId: string | null
  highlightSlotId?: string | null
  isHighlighted?: boolean
}

export default function SessionCard({
  session,
  onEdit,
  onDebrief,
  hints,
  onRemovePlayer,
  onPlayerClick,
  onSlotHover,
  hoveredSlotId,
  highlightSlotId,
  isHighlighted = false,
}: SessionCardProps) {
  const getSlotsForSession = useScheduleStore((s) => s.getSlotsForSession)
  const getPlayerById = useScheduleStore((s) => s.getPlayerById)
  const slots = getSlotsForSession(session.id)

  const depositColor: Record<string, string> = {
    paid: 'bg-board-success text-white',
    unpaid: 'bg-board-danger text-white',
    partial: 'bg-board-accent text-white',
  }

  const statusColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    played: 'bg-emerald-100 text-emerald-700',
    canceled: 'bg-gray-200 text-gray-500',
  }

  const statusIcon: Record<string, React.ReactNode> = {
    scheduled: null,
    played: <CheckCircle2 className="w-3 h-3" />,
    canceled: <XCircle className="w-3 h-3" />,
  }

  const typeColor: Record<string, string> = {
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
    <div className={`bg-board-surface rounded-xl border overflow-hidden card-hover transition-all duration-300 ${
      isHighlighted ? 'border-board-accent shadow-lg shadow-board-accent/20 scale-[1.01]' : 'border-board-border'
    } ${session.status === 'canceled' ? 'opacity-60 grayscale' : ''}`}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-board-text leading-tight truncate">{session.scriptName}</h3>
              <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor[session.status]}`}>
                {statusIcon[session.status]}
                {SESSION_STATUS_LABELS[session.status]}
              </span>
            </div>
            {session.scriptTypes && session.scriptTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {session.scriptTypes.map((t) => (
                  <span
                    key={t}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColor[t] || typeColor['其他']}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onDebrief() }}
              className="p-1 rounded text-board-muted hover:text-board-accent hover:bg-amber-50 transition-colors"
              title="复盘"
            >
              <ClipboardList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="p-1 rounded text-board-muted hover:text-board-text hover:bg-gray-100 transition-colors"
              title="编辑"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-board-muted mb-1">
          {session.playerStructure && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {session.playerStructure}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {session.estimatedDuration}h
          </span>
          {session.dmName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {session.dmName}
            </span>
          )}
          {session.shopName && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {session.shopName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${depositColor[session.depositStatus]}`}>
            <CreditCard className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />
            {DEPOSIT_STATUS_LABELS[session.depositStatus]}
          </span>
        </div>
      </div>

      <div className="px-4 pb-3 space-y-1.5">
        {slots.map((slot) => {
          const player = slot.playerId ? getPlayerById(slot.playerId) : null
          return (
            <SlotItem
              key={slot.id}
              slot={slot}
              player={player}
              onRemove={onRemovePlayer}
              onPlayerClick={onPlayerClick}
              onHover={onSlotHover}
              isHovered={hoveredSlotId === slot.id}
              isHighlighted={highlightSlotId === slot.id}
            />
          )
        })}
      </div>

      {hints.length > 0 && (
        <div className="px-4 pb-3 space-y-1">
          {hints.map((hint, i) => (
            <div
              key={i}
              className={`hint-toast flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] ${getHintColor(hint.type)}`}
            >
              <span className="shrink-0 leading-4">{getHintIcon(hint.type)}</span>
              <span className="leading-4">{hint.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SlotItem({ slot, player, onRemove, onPlayerClick, onHover, isHovered, isHighlighted }: {
  slot: { id: string; slotLabel: string; requiredGender: string; playerId: string | null }
  player: { id: string; nickname: string } | undefined
  onRemove: (slotId: string) => void
  onPlayerClick: (playerId: string) => void
  onHover: (slotId: string | null) => void
  isHovered: boolean
  isHighlighted?: boolean
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${slot.id}`,
    data: { type: 'slot' as const, slotId: slot.id },
    disabled: !!slot.playerId,
  })

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => !slot.playerId && onHover(slot.id)}
      onMouseLeave={() => onHover(null)}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all
        ${isHighlighted ? 'ring-2 ring-board-accent ring-offset-1' : ''}
        ${slot.playerId
          ? 'bg-gray-50 border border-board-border'
          : isOver || isHovered
          ? 'slot-drop-active'
          : 'border border-dashed border-gray-200 bg-gray-50/50'
        }
      `}
    >
      <span className="text-board-muted w-10 shrink-0">{slot.slotLabel}</span>
      <span className="text-[10px] text-board-muted shrink-0">
        {GENDER_LABELS[slot.requiredGender] || '不限'}
      </span>
      {player ? (
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <button
            onClick={() => onPlayerClick(player.id)}
            className="text-board-text font-medium truncate hover:text-board-accent transition-colors"
          >
            {player.nickname}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(slot.id) }}
            className="shrink-0 text-board-muted hover:text-board-danger transition-colors"
            title="移出"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <span className="text-[10px] text-gray-300 flex-1">拖入玩家</span>
      )}
    </div>
  )
}

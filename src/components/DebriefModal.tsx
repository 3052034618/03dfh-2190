import { useState } from 'react'
import { X, Check, Clock, XCircle, Users, MessageSquare } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import type { Session, SessionSlot, SessionPlayerRecord } from '@/types'
import { ATTENDANCE_LABELS } from '@/types'

interface DebriefModalProps {
  session: Session
  onClose: () => void
}

type AttendanceValue = 'on-time' | 'late' | 'no-show' | 'canceled'

interface DebriefRow {
  slotId: string
  slotLabel: string
  playerId: string | null
  playerName: string
  attendance: AttendanceValue
  lateMinutes: number
  noShow: boolean
  experienceNote: string
  existingRecord?: SessionPlayerRecord
}

export default function DebriefModal({ session, onClose }: DebriefModalProps) {
  const getSlotsForSession = useScheduleStore((s) => s.getSlotsForSession)
  const getPlayerById = useScheduleStore((s) => s.getPlayerById)
  const getRecordsForSession = useScheduleStore((s) => s.getRecordsForSession)
  const addSessionPlayerRecord = useScheduleStore((s) => s.addSessionPlayerRecord)
  const updateSessionPlayerRecord = useScheduleStore((s) => s.updateSessionPlayerRecord)
  const setSessionStatus = useScheduleStore((s) => s.setSessionStatus)
  const updateSession = useScheduleStore((s) => s.updateSession)

  const slots = getSlotsForSession(session.id)
  const existingRecords = getRecordsForSession(session.id)

  const buildInitialRows = (): DebriefRow[] => {
    return slots.map((slot: SessionSlot) => {
      const existing = existingRecords.find((r) => r.slotId === slot.id)
      const player = slot.playerId ? getPlayerById(slot.playerId) : undefined
      return {
        slotId: slot.id,
        slotLabel: slot.slotLabel,
        playerId: slot.playerId,
        playerName: player?.nickname || '(空车位)',
        attendance: existing?.attendance || (slot.playerId ? 'on-time' : 'canceled'),
        lateMinutes: existing?.lateMinutes || 0,
        noShow: existing?.noShow || false,
        experienceNote: existing?.experienceNote || '',
        existingRecord: existing,
      }
    })
  }

  const [rows, setRows] = useState<DebriefRow[]>(buildInitialRows())
  const [overallNote, setOverallNote] = useState('')

  const updateRow = (slotId: string, data: Partial<DebriefRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.slotId === slotId ? { ...r, ...data } : r))
    )
  }

  const handleSave = () => {
    rows.forEach((row) => {
      if (!row.playerId) return
      if (row.existingRecord) {
        updateSessionPlayerRecord(row.existingRecord.id, {
          attendance: row.attendance,
          lateMinutes: row.lateMinutes,
          noShow: row.noShow,
          experienceNote: row.experienceNote,
        })
      } else {
        addSessionPlayerRecord({
          sessionId: session.id,
          playerId: row.playerId,
          slotId: row.slotId,
          attendance: row.attendance,
          lateMinutes: row.lateMinutes,
          noShow: row.noShow,
          experienceNote: row.experienceNote,
        })
      }
    })
    setSessionStatus(session.id, 'played')
    if (overallNote.trim()) {
      // 可以存在 session 的一个备注字段，这里暂不处理
    }
    onClose()
  }

  const handleMarkCanceled = () => {
    setSessionStatus(session.id, 'canceled')
    onClose()
  }

  const handleReopen = () => {
    setSessionStatus(session.id, 'scheduled')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-board-surface rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-board-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-board-text">车局复盘</h2>
            <p className="text-xs text-board-muted mt-0.5">
              {session.scriptName} · {session.shopName} · {session.dmName}
            </p>
          </div>
          <button onClick={onClose} className="text-board-muted hover:text-board-text transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.slotId}
                className={`p-4 rounded-xl border transition-colors ${
                  row.playerId ? 'bg-white border-board-border' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-board-accent/10 text-board-accent flex items-center justify-center text-xs font-semibold">
                      {row.slotLabel.replace('号位', '')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-board-text flex items-center gap-2">
                        {row.playerName}
                        {row.noShow && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 text-[10px] font-medium">
                            爽约
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-board-muted mt-0.5">{row.slotLabel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {([
                      { k: 'on-time', label: '准时', icon: <Check className="w-3 h-3" /> },
                      { k: 'late', label: '迟到', icon: <Clock className="w-3 h-3" /> },
                      { k: 'no-show', label: '爽约', icon: <XCircle className="w-3 h-3" /> },
                      { k: 'canceled', label: '取消', icon: <X className="w-3 h-3" /> },
                    ] as const).map((opt) => (
                      <button
                        key={opt.k}
                        type="button"
                        disabled={!row.playerId}
                        onClick={() => {
                          updateRow(row.slotId, {
                            attendance: opt.k,
                            noShow: opt.k === 'no-show',
                            lateMinutes: opt.k === 'late' ? (row.lateMinutes || 15) : 0,
                          })
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          row.attendance === opt.k
                            ? opt.k === 'on-time'
                              ? 'bg-emerald-500 text-white'
                              : opt.k === 'late'
                              ? 'bg-amber-500 text-white'
                              : opt.k === 'no-show'
                              ? 'bg-rose-500 text-white'
                              : 'bg-gray-400 text-white'
                            : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {row.playerId && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-board-muted mb-1">迟到分钟</label>
                      <input
                        type="number"
                        min={0}
                        value={row.lateMinutes}
                        onChange={(e) => updateRow(row.slotId, { lateMinutes: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-board-border text-sm text-board-text focus:outline-none focus:ring-1 focus:ring-board-accent/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-board-muted mb-1">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        体验备注
                      </label>
                      <input
                        value={row.experienceNote}
                        onChange={(e) => updateRow(row.slotId, { experienceNote: e.target.value })}
                        placeholder="例如：体验极佳 / 推理掉线..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-board-border text-sm text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-board-accent/30"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-medium text-amber-800 mb-1">复盘说明</div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  复盘记录会同步到对应玩家的历史印象中，拖入新车局时会自动提示该玩家的历史爽约次数、平均迟到分钟等信息。
                  爽约记录会标记为红色高优先级提醒。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-board-border bg-gray-50 shrink-0">
          <div className="flex gap-2">
            {session.status === 'played' ? (
              <button
                type="button"
                onClick={handleReopen}
                className="px-3 py-1.5 rounded-lg text-xs text-board-muted hover:bg-gray-200 transition-colors"
              >
                重新开放
              </button>
            ) : (
              <button
                type="button"
                onClick={handleMarkCanceled}
                className="px-3 py-1.5 rounded-lg text-xs text-board-danger hover:bg-rose-50 transition-colors"
              >
                标记取消
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-sm text-board-muted hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-board-text hover:bg-gray-800 transition-colors"
            >
              保存复盘
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

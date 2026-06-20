import { useRef, useCallback } from 'react'
import { X, Download } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import { DEPOSIT_STATUS_LABELS, GENDER_LABELS } from '@/types'

interface ExportModalProps {
  onClose: () => void
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const sessions = useScheduleStore((s) => s.sessions)
  const sessionSlots = useScheduleStore((s) => s.sessionSlots)
  const getPlayerById = useScheduleStore((s) => s.getPlayerById)
  const currentWeekKey = useScheduleStore((s) => s.currentWeekKey)
  const exportRef = useRef<HTMLDivElement>(null)

  const weekSessions = sessions.filter((s) => s.weekKey === currentWeekKey)

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: '#FAFAFA',
      scale: 2,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `约本排期_${currentWeekKey}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [currentWeekKey])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-board-surface rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-board-border sticky top-0 bg-board-surface z-10">
          <h2 className="text-base font-semibold text-board-text">导出约本图</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-board-text hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              下载图片
            </button>
            <button onClick={onClose} className="text-board-muted hover:text-board-text transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div ref={exportRef} className="bg-board-bg rounded-xl p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-board-text">约本排期</h3>
              <p className="text-xs text-board-muted mt-1">
                {currentWeekKey} 周刊
              </p>
            </div>

            <div className="space-y-4">
              {weekSessions.map((session) => {
                const slots = sessionSlots
                  .filter((s) => s.sessionId === session.id)
                  .sort((a, b) => a.slotIndex - b.slotIndex)

                return (
                  <div key={session.id} className="bg-board-surface rounded-lg border border-board-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-board-text">{session.scriptName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        session.depositStatus === 'paid' ? 'bg-board-success text-white' :
                        session.depositStatus === 'partial' ? 'bg-board-accent text-white' :
                        'bg-board-danger text-white'
                      }`}>
                        {DEPOSIT_STATUS_LABELS[session.depositStatus]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-board-muted mb-2">
                      {session.playerStructure && <span>{session.playerStructure}</span>}
                      <span>{session.estimatedDuration}h</span>
                      {session.dmName && <span>DM: {session.dmName}</span>}
                      {session.shopName && <span>{session.shopName}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {slots.map((slot) => {
                        const player = slot.playerId ? getPlayerById(slot.playerId) : null
                        return (
                          <div
                            key={slot.id}
                            className={`px-2 py-1 rounded-md text-xs ${
                              player
                                ? 'bg-gray-100 text-board-text font-medium'
                                : 'bg-gray-50 text-gray-300 border border-dashed border-gray-200'
                            }`}
                          >
                            {player ? player.nickname : `${slot.slotLabel}(${GENDER_LABELS[slot.requiredGender]})`}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-6">
              <p className="text-[10px] text-gray-300">约本排期板 · 仅展示必要信息</p>
            </div>
          </div>

          <p className="text-xs text-board-muted mt-4 text-center">
            导出图片仅包含车局基本信息和玩家昵称，不会暴露玩家偏好、备注等隐私信息
          </p>
        </div>
      </div>
    </div>
  )
}

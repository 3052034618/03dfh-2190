import { useRef, useCallback, useState } from 'react'
import { X, Download } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import { DEPOSIT_STATUS_LABELS, GENDER_LABELS } from '@/types'

interface ExportModalProps {
  onClose: () => void
}

interface ExportOptions {
  showDM: boolean
  showShop: boolean
  showDeposit: boolean
  showSlotGender: boolean
  showTypes: boolean
  playerMode: 'nickname' | 'short'
}

const DEFAULT_OPTIONS: ExportOptions = {
  showDM: true,
  showShop: true,
  showDeposit: true,
  showSlotGender: false,
  showTypes: true,
  playerMode: 'nickname',
}

function toShortName(nickname: string): string {
  if (!nickname) return ''
  if (nickname.length <= 2) return nickname
  return nickname.slice(0, 2)
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const sessions = useScheduleStore((s) => s.sessions)
  const sessionSlots = useScheduleStore((s) => s.sessionSlots)
  const getPlayerById = useScheduleStore((s) => s.getPlayerById)
  const currentWeekKey = useScheduleStore((s) => s.currentWeekKey)
  const exportRef = useRef<HTMLDivElement>(null)

  const [opts, setOpts] = useState<ExportOptions>(DEFAULT_OPTIONS)

  const weekSessions = sessions.filter((s) => s.weekKey === currentWeekKey)

  const setOpt = <K extends keyof ExportOptions>(k: K, v: ExportOptions[K]) =>
    setOpts((prev) => ({ ...prev, [k]: v }))

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
        className="bg-board-surface rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-board-border shrink-0">
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

        <div className="flex-1 overflow-y-auto flex">
          <div className="w-[260px] border-r border-board-border p-4 space-y-4 shrink-0">
            <div>
              <h3 className="text-xs font-semibold text-board-text mb-2">显示内容</h3>
              <div className="space-y-2">
                {[
                  { k: 'showDM', label: 'DM主持人' },
                  { k: 'showShop', label: '店铺名称' },
                  { k: 'showDeposit', label: '定金状态' },
                  { k: 'showSlotGender', label: '车位性别要求' },
                  { k: 'showTypes', label: '本类型标签' },
                ].map((item) => (
                  <label key={item.k} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={opts[item.k as keyof ExportOptions] as boolean}
                      onChange={(e) =>
                        setOpt(item.k as keyof ExportOptions, e.target.checked as ExportOptions[keyof ExportOptions])
                      }
                      className="w-3.5 h-3.5 rounded border-board-border text-board-accent focus:ring-board-accent focus:ring-offset-0"
                    />
                    <span className="text-xs text-board-text">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-board-text mb-2">玩家显示</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpt('playerMode', 'nickname')}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    opts.playerMode === 'nickname'
                      ? 'bg-board-text text-white'
                      : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  完整昵称
                </button>
                <button
                  onClick={() => setOpt('playerMode', 'short')}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    opts.playerMode === 'short'
                      ? 'bg-board-text text-white'
                      : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  两字简称
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-board-border">
              <p className="text-[10px] text-board-muted leading-relaxed">
                提示：建议勾选尽量少的信息发送到微信群，保护玩家隐私。默认配置已兼顾信息传达与隐私安全。
              </p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div
              ref={exportRef}
              className="bg-board-bg rounded-xl p-6 mx-auto"
              style={{ maxWidth: 480 }}
            >
              <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-board-text">约本排期</h3>
                <p className="text-xs text-board-muted mt-1">{currentWeekKey} 周刊</p>
              </div>

              {weekSessions.length === 0 ? (
                <div className="text-center py-8 text-xs text-board-muted">本周暂无车局</div>
              ) : (
                <div className="space-y-3.5">
                  {weekSessions.map((session) => {
                    const slots = sessionSlots
                      .filter((s) => s.sessionId === session.id)
                      .sort((a, b) => a.slotIndex - b.slotIndex)
                    const filled = slots.filter((s) => s.playerId).length
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
                      <div key={session.id} className="bg-board-surface rounded-lg border border-board-border p-3.5">
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="min-w-0 pr-2">
                            <h4 className="text-sm font-semibold text-board-text leading-tight">
                              {session.scriptName}
                            </h4>
                            {opts.showTypes && session.scriptTypes && session.scriptTypes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {session.scriptTypes.map((t) => (
                                  <span
                                    key={t}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                      typeColor[t] || typeColor['其他']
                                    }`}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {opts.showDeposit && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                                session.depositStatus === 'paid'
                                  ? 'bg-board-success text-white'
                                  : session.depositStatus === 'partial'
                                  ? 'bg-board-accent text-white'
                                  : 'bg-board-danger text-white'
                              }`}
                            >
                              {DEPOSIT_STATUS_LABELS[session.depositStatus]}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-board-muted mb-2">
                          <span>{filled}/{slots.length}人</span>
                          <span>{session.estimatedDuration}h</span>
                          {session.playerStructure && <span>{session.playerStructure}</span>}
                          {opts.showDM && session.dmName && <span>DM: {session.dmName}</span>}
                          {opts.showShop && session.shopName && <span>{session.shopName}</span>}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {slots.map((slot) => {
                            const player = slot.playerId ? getPlayerById(slot.playerId) : null
                            const label = player
                              ? opts.playerMode === 'short'
                                ? toShortName(player.nickname)
                                : player.nickname
                              : opts.showSlotGender
                              ? `${slot.slotLabel}(${GENDER_LABELS[slot.requiredGender]})`
                              : slot.slotLabel
                            return (
                              <div
                                key={slot.id}
                                className={`px-2 py-1 rounded-md text-xs ${
                                  player
                                    ? 'bg-gray-100 text-board-text font-medium'
                                    : 'bg-gray-50 text-gray-400 border border-dashed border-gray-200'
                                }`}
                              >
                                {label}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="text-center mt-5">
                <p className="text-[10px] text-gray-300">约本排期板 · 仅展示必要信息</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

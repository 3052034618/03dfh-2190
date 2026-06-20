import { useRef, useCallback, useState } from 'react'
import { X, Download, ClipboardList, Calendar } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import { DEPOSIT_STATUS_LABELS, GENDER_LABELS, ATTENDANCE_LABELS } from '@/types'
import type { SessionPlayerRecord } from '@/types'

interface ExportModalProps {
  onClose: () => void
  filterSessionIds?: string[]
}

interface ExportOptions {
  showDM: boolean
  showShop: boolean
  showDeposit: boolean
  showSlotGender: boolean
  showTypes: boolean
  playerMode: 'nickname' | 'short'
  exportMode: 'schedule' | 'debrief'
}

const DEFAULT_OPTIONS: ExportOptions = {
  showDM: true,
  showShop: true,
  showDeposit: true,
  showSlotGender: false,
  showTypes: true,
  playerMode: 'nickname',
  exportMode: 'schedule',
}

function toShortName(nickname: string): string {
  if (!nickname) return ''
  if (nickname.length <= 2) return nickname
  return nickname.slice(0, 2)
}

export default function ExportModal({ onClose, filterSessionIds }: ExportModalProps) {
  const sessions = useScheduleStore((s) => s.sessions)
  const sessionSlots = useScheduleStore((s) => s.sessionSlots)
  const getPlayerById = useScheduleStore((s) => s.getPlayerById)
  const getRecordsForSession = useScheduleStore((s) => s.getRecordsForSession)
  const currentWeekKey = useScheduleStore((s) => s.currentWeekKey)
  const exportRef = useRef<HTMLDivElement>(null)

  const [opts, setOpts] = useState<ExportOptions>(DEFAULT_OPTIONS)

  let weekSessions = sessions.filter((s) => s.weekKey === currentWeekKey)
  if (filterSessionIds !== undefined) {
    weekSessions = weekSessions.filter((s) => filterSessionIds.includes(s.id))
  }

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
    const suffix = opts.exportMode === 'debrief' ? '复盘' : '排期'
    const link = document.createElement('a')
    link.download = `约本${suffix}_${currentWeekKey}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [currentWeekKey, opts.exportMode])

  const getAttendanceColor = (attendance: string) => {
    switch (attendance) {
      case 'on-time': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'late': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'no-show': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'canceled': return 'bg-gray-100 text-gray-500 border-gray-200'
      default: return 'bg-gray-50 text-gray-500 border-gray-200'
    }
  }

  const renderDebriefView = () => {
    const playedSessions = weekSessions.filter((s) => s.status === 'played')
    if (playedSessions.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-amber-200">
            <ClipboardList className="w-10 h-10 text-amber-400" />
          </div>
          <p className="text-base font-semibold text-board-text mb-1">本周车局复盘进度 0%</p>
          <p className="text-sm text-board-muted mb-1">暂无已完成的车局</p>
          <p className="text-xs text-gray-400 mb-4">开完车后，在车局卡片上点击「复盘」按钮记录</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-board-bg border border-dashed border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-board-muted" />
            <span className="text-xs text-board-muted">{currentWeekKey} · 内部管理</span>
          </div>
        </div>
      )
    }

    const overallStats = {
      total: 0, onTime: 0, late: 0, noShow: 0, canceled: 0, positive: 0,
    }

    return (
      <div className="space-y-4">
        {playedSessions.map((session) => {
          const records = getRecordsForSession(session.id)
          const slots = sessionSlots
            .filter((s) => s.sessionId === session.id)
            .sort((a, b) => a.slotIndex - b.slotIndex)

          const filled = slots.filter((s) => s.playerId)
          const onTime = filled.filter((s) => {
            const r = records.find((rr) => rr.slotId === s.id)
            return r?.attendance === 'on-time'
          }).length
          const late = filled.filter((s) => {
            const r = records.find((rr) => rr.slotId === s.id)
            return r?.attendance === 'late'
          }).length
          const noShow = filled.filter((s) => {
            const r = records.find((rr) => rr.slotId === s.id)
            return r?.attendance === 'no-show'
          }).length
          const canceled = filled.filter((s) => {
            const r = records.find((rr) => rr.slotId === s.id)
            return r?.attendance === 'canceled'
          }).length
          const positive = records.filter((r) => r.isPositiveFeedback).length

          overallStats.total += filled.length
          overallStats.onTime += onTime
          overallStats.late += late
          overallStats.noShow += noShow
          overallStats.canceled += canceled
          overallStats.positive += positive

          const abnormalRecords = records.filter(
            (r) => r.attendance !== 'on-time'
          )
          const positiveNotes = records.filter(
            (r) => r.isPositiveFeedback || (r.experienceNote && r.attendance === 'on-time')
          )

          return (
            <div key={session.id} className="bg-board-surface rounded-lg border border-board-border overflow-hidden">
              <div className="px-3.5 py-2.5 bg-gray-50 border-b border-board-border flex items-start justify-between">
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm font-semibold text-board-text leading-tight">
                    {session.scriptName}
                  </h4>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-board-muted mt-0.5">
                    <span>{filled.length}人</span>
                    {session.estimatedDuration}h
                    {opts.showDM && session.dmName && <span>DM: {session.dmName}</span>}
                    {opts.showShop && session.shopName && <span>{session.shopName}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {opts.showDeposit && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
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
              </div>

              <div className="px-3.5 py-2.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] mb-2">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    ✓ 准时 {onTime}
                  </span>
                  {late > 0 && (
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      迟到 {late}
                    </span>
                  )}
                  {noShow > 0 && (
                    <span className="flex items-center gap-1 text-rose-600 font-medium">
                      爽约 {noShow}
                    </span>
                  )}
                  {canceled > 0 && (
                    <span className="flex items-center gap-1 text-gray-500 font-medium">
                      取消 {canceled}
                    </span>
                  )}
                  {positive > 0 && (
                    <span className="flex items-center gap-1 text-sky-600 font-medium">
                      👍 {positive}
                    </span>
                  )}
                </div>

                {abnormalRecords.length > 0 && (
                  <div className="space-y-1 pt-1.5 border-t border-dashed border-gray-200">
                    {abnormalRecords.map((record) => {
                      const player = getPlayerById(record.playerId)
                      const slot = slots.find((s) => s.id === record.slotId)
                      if (!player) return null
                      const playerLabel = opts.playerMode === 'short'
                        ? toShortName(player.nickname)
                        : player.nickname

                      return (
                        <div
                          key={record.id}
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border text-xs ${getAttendanceColor(record.attendance)}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{playerLabel}</span>
                            {opts.showSlotGender && slot && (
                              <span className="text-[10px] opacity-60">
                                ({GENDER_LABELS[slot.requiredGender]})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium">
                              {ATTENDANCE_LABELS[record.attendance]}
                            </span>
                            {record.attendance === 'late' && record.lateMinutes && record.lateMinutes > 0 && (
                              <span className="text-[10px]">迟{record.lateMinutes}分</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {(positiveNotes.length > 0 || records.some((r) => r.experienceNote)) && (
                  <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-200 space-y-1">
                    {records
                      .filter((r) => r.experienceNote || (r.isPositiveFeedback && r.attendance === 'on-time'))
                      .map((record) => {
                        const player = getPlayerById(record.playerId)
                        if (!player) return null
                        const playerLabel = opts.playerMode === 'short'
                          ? toShortName(player.nickname)
                          : player.nickname
                        return (
                          <div key={record.id} className="text-[11px] text-board-muted">
                            {record.isPositiveFeedback && (
                              <span className="text-sky-600 font-medium">👍</span>
                            )}
                            <span className="font-medium text-board-text ml-0.5">{playerLabel}：</span>
                            {record.experienceNote || (record.isPositiveFeedback ? '体验良好' : '')}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {playedSessions.length > 1 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-3">
            <div className="text-[10px] font-medium text-amber-800 mb-1.5 uppercase tracking-wide">本周汇总</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="text-board-text font-medium">共 {overallStats.total} 人次</span>
              <span className="text-emerald-600">准时 {overallStats.onTime}</span>
              {overallStats.late > 0 && <span className="text-amber-600">迟到 {overallStats.late}</span>}
              {overallStats.noShow > 0 && <span className="text-rose-600">爽约 {overallStats.noShow}</span>}
              {overallStats.canceled > 0 && <span className="text-gray-500">取消 {overallStats.canceled}</span>}
              {overallStats.positive > 0 && <span className="text-sky-600">好评 {overallStats.positive}</span>}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderScheduleView = () => {
    if (weekSessions.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-board-muted mb-1">本周暂无车局</p>
          {filterSessionIds !== undefined && filterSessionIds.length === 0 && (
            <p className="text-xs text-gray-400">当前筛选条件下没有可导出的车局</p>
          )}
        </div>
      )
    }

    return (
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
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-board-surface rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-board-border shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-board-text">
              {opts.exportMode === 'debrief' ? '导出复盘图' : '导出约本图'}
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setOpt('exportMode', 'schedule')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  opts.exportMode === 'schedule'
                    ? 'bg-white text-board-text shadow-sm'
                    : 'text-board-muted hover:text-board-text'
                }`}
              >
                <Calendar className="w-3 h-3" />
                排期版
              </button>
              <button
                onClick={() => setOpt('exportMode', 'debrief')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  opts.exportMode === 'debrief'
                    ? 'bg-white text-board-text shadow-sm'
                    : 'text-board-muted hover:text-board-text'
                }`}
              >
                <ClipboardList className="w-3 h-3" />
                复盘版
              </button>
            </div>
          </div>
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
            {opts.exportMode === 'schedule' && (
              <>
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
              </>
            )}

            {opts.exportMode === 'debrief' && (
              <>
                <div>
                  <h3 className="text-xs font-semibold text-board-text mb-2">显示内容</h3>
                  <div className="space-y-2">
                    {[
                      { k: 'showDM', label: 'DM主持人' },
                      { k: 'showShop', label: '店铺名称' },
                      { k: 'showDeposit', label: '定金状态' },
                      { k: 'showSlotGender', label: '车位性别要求' },
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
              </>
            )}

            <div className="pt-3 border-t border-board-border">
              <p className="text-[10px] text-board-muted leading-relaxed">
                {opts.exportMode === 'debrief'
                  ? '复盘版仅展示已完成车局的实际到场情况和体验备注，适合内部管理存档。'
                  : filterSessionIds !== undefined && filterSessionIds.length === 0
                  ? '当前筛选范围内没有车局，导出将生成空白图。'
                  : '建议勾选尽量少的信息发送到微信群，保护玩家隐私。'
                }
              </p>
              {filterSessionIds !== undefined && (
                <p className="text-[10px] text-board-accent mt-2 font-medium">
                  已按当前筛选导出，共 {weekSessions.length} 个车局
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div
              ref={exportRef}
              className="bg-board-bg rounded-xl p-6 mx-auto"
              style={{ maxWidth: 480 }}
            >
              <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-board-text">
                  {opts.exportMode === 'debrief' ? '车局复盘' : '约本排期'}
                </h3>
                <p className="text-xs text-board-muted mt-1">{currentWeekKey} 周刊</p>
              </div>

              {opts.exportMode === 'debrief' ? renderDebriefView() : renderScheduleView()}

              <div className="text-center mt-5">
                <p className="text-[10px] text-gray-300">约本排期板 · 内部管理使用</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

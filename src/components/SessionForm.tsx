import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import type { Session } from '@/types'
import { SCRIPT_TYPES } from '@/types'

interface SessionFormProps {
  session?: Session
  onClose: () => void
}

export default function SessionForm({ session, onClose }: SessionFormProps) {
  const addSession = useScheduleStore((s) => s.addSession)
  const updateSession = useScheduleStore((s) => s.updateSession)
  const deleteSession = useScheduleStore((s) => s.deleteSession)

  const [scriptName, setScriptName] = useState(session?.scriptName || '')
  const [scriptTypes, setScriptTypes] = useState<string[]>(session?.scriptTypes || [])
  const [playerStructure, setPlayerStructure] = useState(session?.playerStructure || '')
  const [estimatedDuration, setEstimatedDuration] = useState(session?.estimatedDuration || 4)
  const [dmName, setDmName] = useState(session?.dmName || '')
  const [shopName, setShopName] = useState(session?.shopName || '')
  const [depositStatus, setDepositStatus] = useState<Session['depositStatus']>(session?.depositStatus || 'unpaid')
  const [dayType, setDayType] = useState<'weekday' | 'weekend' | 'any'>(session?.sessionTime?.dayType || 'any')
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night' | 'late' | 'any'>(session?.sessionTime?.timeOfDay || 'any')
  const [slotCount, setSlotCount] = useState(6)
  const [slotGenders, setSlotGenders] = useState<string[]>(
    Array(6).fill('any')
  )

  const isEdit = !!session

  const toggleType = (t: string) => {
    setScriptTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scriptName.trim()) return

    if (isEdit) {
      updateSession(session.id, {
        scriptName,
        scriptTypes,
        playerStructure,
        estimatedDuration,
        dmName,
        shopName,
        depositStatus,
        sessionTime: { dayType, timeOfDay },
      })
    } else {
      addSession({
        scriptName,
        scriptTypes,
        playerStructure,
        estimatedDuration,
        dmName,
        shopName,
        depositStatus,
        sessionTime: { dayType, timeOfDay },
        slotCount,
        slotGenders: slotGenders.slice(0, slotCount),
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (session) {
      deleteSession(session.id)
      onClose()
    }
  }

  const updateSlotGender = (index: number, gender: string) => {
    const newGenders = [...slotGenders]
    newGenders[index] = gender
    setSlotGenders(newGenders)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-board-surface rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-board-border sticky top-0 bg-board-surface z-10">
          <h2 className="text-base font-semibold text-board-text">
            {isEdit ? '编辑车局' : '新建车局'}
          </h2>
          <button onClick={onClose} className="text-board-muted hover:text-board-text transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-board-muted mb-1">本名 *</label>
            <input
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="例：病娇男孩的精分日记"
              className="w-full px-3 py-2 rounded-lg border border-board-border text-sm text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-board-accent/30 focus:border-board-accent transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-board-muted mb-1.5">本类型标签（用于智能匹配）</label>
            <div className="flex flex-wrap gap-1.5">
              {SCRIPT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    scriptTypes.includes(t)
                      ? 'bg-board-text text-white'
                      : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-board-muted mb-1">人数结构</label>
              <input
                value={playerStructure}
                onChange={(e) => setPlayerStructure(e.target.value)}
                placeholder="例：3男3女"
                className="w-full px-3 py-2 rounded-lg border border-board-border text-sm text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-board-accent/30 focus:border-board-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-board-muted mb-1">预计时长(h)</label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                min={1}
                max={12}
                className="w-full px-3 py-2 rounded-lg border border-board-border text-sm text-board-text focus:outline-none focus:ring-2 focus:ring-board-accent/30 focus:border-board-accent transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-board-muted mb-1">DM</label>
              <input
                value={dmName}
                onChange={(e) => setDmName(e.target.value)}
                placeholder="DM名字"
                className="w-full px-3 py-2 rounded-lg border border-board-border text-sm text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-board-accent/30 focus:border-board-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-board-muted mb-1">店铺</label>
              <input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="店铺名称"
                className="w-full px-3 py-2 rounded-lg border border-board-border text-sm text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-board-accent/30 focus:border-board-accent transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-board-muted mb-1">时段类型</label>
              <div className="flex gap-1">
                {([
                  { k: 'any', label: '不限' },
                  { k: 'weekday', label: '工作日' },
                  { k: 'weekend', label: '周末' },
                ] as const).map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    onClick={() => setDayType(opt.k)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      dayType === opt.k
                        ? 'bg-board-info text-white'
                        : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-board-muted mb-1">时段</label>
              <div className="flex gap-1">
                {([
                  { k: 'any', label: '不限' },
                  { k: 'day', label: '白天' },
                  { k: 'night', label: '晚间' },
                  { k: 'late', label: '深夜' },
                ] as const).map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    onClick={() => setTimeOfDay(opt.k)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      timeOfDay === opt.k
                        ? 'bg-board-info text-white'
                        : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-board-muted mb-1">定金状态</label>
            <div className="flex gap-2">
              {(['unpaid', 'partial', 'paid'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setDepositStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    depositStatus === status
                      ? status === 'paid'
                        ? 'bg-board-success text-white'
                        : status === 'partial'
                        ? 'bg-board-accent text-white'
                        : 'bg-board-danger text-white'
                      : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  {status === 'paid' ? '已付' : status === 'partial' ? '部分' : '未付'}
                </button>
              ))}
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-board-muted mb-1">车位数</label>
              <input
                type="number"
                value={slotCount}
                onChange={(e) => {
                  const n = Math.min(12, Math.max(1, Number(e.target.value)))
                  setSlotCount(n)
                  setSlotGenders((prev) => {
                    const arr = [...prev]
                    while (arr.length < n) arr.push('any')
                    return arr.slice(0, n)
                  })
                }}
                min={1}
                max={12}
                className="w-20 px-3 py-2 rounded-lg border border-board-border text-sm text-board-text focus:outline-none focus:ring-2 focus:ring-board-accent/30 focus:border-board-accent transition-colors"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.from({ length: slotCount }, (_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-xs text-board-muted">{i + 1}号</span>
                    <select
                      value={slotGenders[i] || 'any'}
                      onChange={(e) => updateSlotGender(i, e.target.value)}
                      className="px-1.5 py-0.5 rounded border border-board-border text-xs text-board-text focus:outline-none"
                    >
                      <option value="any">不限</option>
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-board-danger hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                删除车局
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-sm text-board-muted hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!scriptName.trim()}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-board-text hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isEdit ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

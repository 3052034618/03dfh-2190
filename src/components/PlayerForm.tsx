import { useState } from 'react'
import { X, Trash2, Plus } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import type { Player, PlayRecord } from '@/types'
import { SCRIPT_TYPES, TIME_SLOT_OPTIONS } from '@/types'

interface PlayerFormProps {
  player?: Player
  onClose: () => void
}

export default function PlayerForm({ player, onClose }: PlayerFormProps) {
  const addPlayer = useScheduleStore((s) => s.addPlayer)
  const updatePlayer = useScheduleStore((s) => s.updatePlayer)
  const deletePlayer = useScheduleStore((s) => s.deletePlayer)
  const addPlayRecord = useScheduleStore((s) => s.addPlayRecord)
  const deletePlayRecord = useScheduleStore((s) => s.deletePlayRecord)
  const playRecords = useScheduleStore((s) => s.playRecords)

  const [nickname, setNickname] = useState(player?.nickname || '')
  const [preferenceTypes, setPreferenceTypes] = useState<string[]>(player?.preferenceTypes || [])
  const [canStayUp, setCanStayUp] = useState(player?.canStayUp ?? true)
  const [acceptCrossGender, setAcceptCrossGender] = useState(player?.acceptCrossGender ?? true)
  const [lateNote, setLateNote] = useState(player?.lateNote || '')
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(player?.availableTimeSlots || [])

  const [newPlayScript, setNewPlayScript] = useState('')
  const [newPlayType, setNewPlayType] = useState('')
  const [newPlayShop, setNewPlayShop] = useState('')

  const isEdit = !!player
  const playerRecords = player
    ? playRecords.filter((r) => r.playerId === player.id).sort((a, b) => b.playedAt - a.playedAt)
    : []

  const togglePreference = (type: string) => {
    setPreferenceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleAddPlayRecord = () => {
    if (!newPlayScript.trim() || !player) return
    addPlayRecord({
      playerId: player.id,
      scriptName: newPlayScript,
      scriptType: newPlayType,
      shopName: newPlayShop,
      playedAt: Date.now(),
    })
    setNewPlayScript('')
    setNewPlayType('')
    setNewPlayShop('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return

    if (isEdit) {
      updatePlayer(player.id, {
        nickname,
        preferenceTypes,
        canStayUp,
        acceptCrossGender,
        lateNote,
        availableTimeSlots,
      })
    } else {
      addPlayer({
        nickname,
        preferenceTypes,
        canStayUp,
        acceptCrossGender,
        lateNote,
        availableTimeSlots,
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (player) {
      deletePlayer(player.id)
      onClose()
    }
  }

  const toggleTimeSlot = (slot: string) => {
    setAvailableTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-board-surface rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-board-border sticky top-0 bg-board-surface z-10">
          <h2 className="text-base font-semibold text-board-text">
            {isEdit ? '编辑玩家' : '添加玩家'}
          </h2>
          <button onClick={onClose} className="text-board-muted hover:text-board-text transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-board-muted mb-1">昵称 *</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="玩家昵称"
              className="w-full px-3 py-2 rounded-lg border border-board-border text-sm text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-board-accent/30 focus:border-board-accent transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-board-muted mb-1">偏好类型</label>
            <div className="flex flex-wrap gap-1.5">
              {SCRIPT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => togglePreference(type)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    preferenceTypes.includes(type)
                      ? 'bg-board-text text-white'
                      : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-board-muted mb-2">能否熬夜</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCanStayUp(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    canStayUp ? 'bg-board-success text-white' : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  能熬夜
                </button>
                <button
                  type="button"
                  onClick={() => setCanStayUp(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !canStayUp ? 'bg-board-danger text-white' : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  不能熬夜
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-board-muted mb-2">是否介意反串</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAcceptCrossGender(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    acceptCrossGender ? 'bg-board-info text-white' : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  可反串
                </button>
                <button
                  type="button"
                  onClick={() => setAcceptCrossGender(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !acceptCrossGender ? 'bg-board-danger text-white' : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  不接受
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-board-muted mb-1">可用时间段</label>
            <div className="flex flex-wrap gap-1.5">
              {TIME_SLOT_OPTIONS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleTimeSlot(slot)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    availableTimeSlots.includes(slot)
                      ? 'bg-board-info text-white'
                      : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-board-muted mb-1">迟到备注</label>
            <input
              value={lateNote}
              onChange={(e) => setLateNote(e.target.value)}
              placeholder="例：经常迟到15分钟"
              className="w-full px-3 py-2 rounded-lg border border-board-border text-sm text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-board-accent/30 focus:border-board-accent transition-colors"
            />
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-medium text-board-muted mb-2">最近玩过的本</label>
              {playerRecords.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {playerRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 text-xs">
                      <span className="text-board-text">{record.scriptName}</span>
                      <div className="flex items-center gap-2">
                        {record.scriptType && <span className="text-board-muted">{record.scriptType}</span>}
                        {record.shopName && <span className="text-board-muted">{record.shopName}</span>}
                        <button
                          type="button"
                          onClick={() => deletePlayRecord(record.id)}
                          className="text-board-danger hover:bg-rose-50 rounded p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
                <input
                  value={newPlayScript}
                  onChange={(e) => setNewPlayScript(e.target.value)}
                  placeholder="本名"
                  className="flex-1 px-2 py-1 rounded border border-board-border text-xs text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-board-accent/30"
                />
                <select
                  value={newPlayType}
                  onChange={(e) => setNewPlayType(e.target.value)}
                  className="px-2 py-1 rounded border border-board-border text-xs text-board-text focus:outline-none"
                >
                  <option value="">类型</option>
                  {SCRIPT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  value={newPlayShop}
                  onChange={(e) => setNewPlayShop(e.target.value)}
                  placeholder="店铺"
                  className="w-16 px-2 py-1 rounded border border-board-border text-xs text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-board-accent/30"
                />
                <button
                  type="button"
                  onClick={handleAddPlayRecord}
                  disabled={!newPlayScript.trim()}
                  className="px-2 py-1 rounded text-xs bg-board-text text-white disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" />
                </button>
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
                删除玩家
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
                disabled={!nickname.trim()}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-board-text hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isEdit ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

import { Search, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useScheduleStore } from '@/store/scheduleStore'
import PlayerCard from './PlayerCard'
import type { Player, TimePreference } from '@/types'
import { SCRIPT_TYPES, TIME_PREFERENCE_LABELS, hasAnyTimePreference } from '@/types'

interface PlayerPanelProps {
  onAddPlayer: () => void
  onEditPlayer: (player: Player) => void
}

interface TimeFilter {
  weekdayDay: boolean
  weekdayNight: boolean
  weekendDay: boolean
  weekendNight: boolean
  lateNight: boolean
}

interface FilterState {
  search: string
  types: string[]
  time: TimeFilter
  canStayUp: 'any' | 'yes' | 'no'
  acceptCross: 'any' | 'yes' | 'no'
}

const DEFAULT_TIME_FILTER: TimeFilter = {
  weekdayDay: false,
  weekdayNight: false,
  weekendDay: false,
  weekendNight: false,
  lateNight: false,
}

const DEFAULT_FILTER: FilterState = {
  search: '',
  types: [],
  time: { ...DEFAULT_TIME_FILTER },
  canStayUp: 'any',
  acceptCross: 'any',
}

function hasTimeFilter(tf: TimeFilter): boolean {
  return tf.weekdayDay || tf.weekdayNight || tf.weekendDay || tf.weekendNight || tf.lateNight
}

function matchesTimeFilter(pref: TimePreference, filter: TimeFilter): boolean {
  if (!hasTimeFilter(filter)) return true
  if (!hasAnyTimePreference(pref)) return true
  if (filter.weekdayDay && pref.weekdayDay) return true
  if (filter.weekdayNight && pref.weekdayNight) return true
  if (filter.weekendDay && pref.weekendDay) return true
  if (filter.weekendNight && pref.weekendNight) return true
  if (filter.lateNight && pref.lateNight) return true
  return false
}

export default function PlayerPanel({ onAddPlayer, onEditPlayer }: PlayerPanelProps) {
  const players = useScheduleStore((s) => s.players)
  const getPlayerAssignedSlot = useScheduleStore((s) => s.getPlayerAssignedSlot)
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)

  const activeTypeCount = filter.types.length
  const hasTime = hasTimeFilter(filter.time)

  const isAnyActive =
    activeTypeCount > 0 ||
    hasTime ||
    filter.canStayUp !== 'any' ||
    filter.acceptCross !== 'any' ||
    filter.search !== ''

  const toggleType = (t: string) => {
    setFilter((f) => ({
      ...f,
      types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t],
    }))
  }

  const toggleTime = (key: keyof TimeFilter) => {
    setFilter((f) => ({ ...f, time: { ...f.time, [key]: !f.time[key] } }))
  }

  const filtered = players.filter((p) => {
    if (filter.search && !p.nickname.toLowerCase().includes(filter.search.toLowerCase())) return false
    if (filter.types.length > 0 && !filter.types.some((t) => p.preferenceTypes.includes(t))) return false
    if (!matchesTimeFilter(p.timePreference, filter.time)) return false
    if (filter.canStayUp !== 'any' && (filter.canStayUp === 'yes') !== p.canStayUp) return false
    if (filter.acceptCross !== 'any' && (filter.acceptCross === 'yes') !== p.acceptCrossGender) return false
    return true
  })

  const assignedIds = new Set(
    players
      .map((p) => getPlayerAssignedSlot(p.id))
      .filter(Boolean)
      .map((s) => s!.playerId)
  )

  const available = filtered.filter((p) => !assignedIds.has(p.id))
  const assigned = filtered.filter((p) => assignedIds.has(p.id))

  const timeKeys: (keyof TimePreference)[] = ['weekdayDay', 'weekdayNight', 'weekendDay', 'weekendNight', 'lateNight']

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-board-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-board-text uppercase tracking-wider">玩家池</h2>
          <div className="flex items-center gap-1">
            {isAnyActive && (
              <button
                onClick={() => setFilter(DEFAULT_FILTER)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-board-danger hover:bg-rose-50 transition-colors"
              >
                <X className="w-3 h-3" />
                重置
              </button>
            )}
            <button
              onClick={onAddPlayer}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-board-muted hover:text-board-text hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
              添加
            </button>
          </div>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            placeholder="搜索玩家..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-board-border text-xs text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-board-accent/20 focus:border-board-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-board-muted uppercase">偏好类型</span>
              {activeTypeCount > 0 && (
                <span className="text-[10px] text-board-accent">{activeTypeCount}项</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {SCRIPT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    filter.types.includes(t)
                      ? 'bg-board-text text-white'
                      : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-board-muted uppercase">可用时间</span>
              {hasTime && (
                <span className="text-[10px] text-board-info">已筛选</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {timeKeys.map((k) => (
                <button
                  key={k}
                  onClick={() => toggleTime(k)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors text-left ${
                    filter.time[k]
                      ? 'bg-board-info text-white'
                      : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                  }`}
                >
                  {TIME_PREFERENCE_LABELS[k]}
                </button>
              ))}
            </div>
            <p className="mt-0.5 text-[9px] text-gray-400">未填时间偏好的玩家默认全部显示</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-medium text-board-muted uppercase block mb-1">熬夜</span>
              <div className="flex gap-1">
                {([
                  { k: 'any', label: '全部' },
                  { k: 'yes', label: '能' },
                  { k: 'no', label: '不能' },
                ] as const).map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => setFilter({ ...filter, canStayUp: opt.k })}
                    className={`flex-1 px-1 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      filter.canStayUp === opt.k
                        ? 'bg-board-text text-white'
                        : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-medium text-board-muted uppercase block mb-1">反串</span>
              <div className="flex gap-1">
                {([
                  { k: 'any', label: '全部' },
                  { k: 'yes', label: '可' },
                  { k: 'no', label: '拒' },
                ] as const).map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => setFilter({ ...filter, acceptCross: opt.k })}
                    className={`flex-1 px-1 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      filter.acceptCross === opt.k
                        ? 'bg-board-text text-white'
                        : 'bg-gray-100 text-board-muted hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {available.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-medium text-board-success uppercase tracking-wider">空闲</span>
              <span className="text-[10px] text-board-muted">{available.length}人</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {available.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onEdit={() => onEditPlayer(player)}
                  isAssigned={false}
                />
              ))}
            </div>
          </div>
        )}

        {assigned.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-medium text-board-muted uppercase tracking-wider">已入局</span>
              <span className="text-[10px] text-board-muted">{assigned.length}人</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {assigned.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onEdit={() => onEditPlayer(player)}
                  isAssigned={true}
                />
              ))}
            </div>
          </div>
        )}

        {players.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-xl">👥</span>
            </div>
            <p className="text-sm text-board-muted mb-1">还没有玩家</p>
            <p className="text-xs text-gray-400">点击上方「添加」创建玩家卡片</p>
          </div>
        )}

        {players.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-board-muted mb-1">没有符合筛选的玩家</p>
            <button
              onClick={() => setFilter(DEFAULT_FILTER)}
              className="text-xs text-board-info hover:underline"
            >
              清除筛选条件
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

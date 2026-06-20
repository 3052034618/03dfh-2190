import { Search, Plus } from 'lucide-react'
import { useState } from 'react'
import { useScheduleStore } from '@/store/scheduleStore'
import PlayerCard from './PlayerCard'
import type { Player } from '@/types'

interface PlayerPanelProps {
  onAddPlayer: () => void
  onEditPlayer: (player: Player) => void
}

export default function PlayerPanel({ onAddPlayer, onEditPlayer }: PlayerPanelProps) {
  const players = useScheduleStore((s) => s.players)
  const getPlayerAssignedSlot = useScheduleStore((s) => s.getPlayerAssignedSlot)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('')

  const filtered = players.filter((p) => {
    const matchSearch = !search || p.nickname.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || p.preferenceTypes.includes(filterType)
    return matchSearch && matchType
  })

  const assignedIds = new Set(
    players
      .map((p) => getPlayerAssignedSlot(p.id))
      .filter(Boolean)
      .map((s) => s!.playerId)
  )

  const available = filtered.filter((p) => !assignedIds.has(p.id))
  const assigned = filtered.filter((p) => assignedIds.has(p.id))

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-board-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-board-text uppercase tracking-wider">玩家池</h2>
          <button
            onClick={onAddPlayer}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-board-muted hover:text-board-text hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-3 h-3" />
            添加
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索玩家..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-board-border text-xs text-board-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-board-accent/20 focus:border-board-accent transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {['', '情感', '硬核', '机制', '恐怖', '欢乐', '阵营', '推理'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                filterType === type
                  ? 'bg-board-text text-white'
                  : 'bg-gray-100 text-board-muted hover:bg-gray-200'
              }`}
            >
              {type || '全部'}
            </button>
          ))}
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
      </div>
    </div>
  )
}

import { Award, AlertTriangle, Clock, XOctagon, Star, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import type { Player, SessionPlayerRecord } from '@/types'
import { ATTENDANCE_LABELS } from '@/types'

interface ReputationPanelProps {
  onEditPlayer: (player: Player) => void
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600'
  if (score >= 65) return 'text-board-accent'
  if (score >= 40) return 'text-amber-600'
  return 'text-board-danger'
}

function getScoreBg(score: number): string {
  if (score >= 85) return 'bg-emerald-50 border-emerald-200'
  if (score >= 65) return 'bg-amber-50 border-board-accent/30'
  if (score >= 40) return 'bg-orange-50 border-orange-200'
  return 'bg-rose-50 border-rose-200'
}

function getAttendanceIcon(att: SessionPlayerRecord['attendance']) {
  switch (att) {
    case 'on-time': return <Star className="w-3 h-3 text-emerald-500" />
    case 'late': return <Clock className="w-3 h-3 text-amber-500" />
    case 'no-show': return <XOctagon className="w-3 h-3 text-rose-500" />
    case 'canceled': return <AlertTriangle className="w-3 h-3 text-gray-500" />
  }
}

export default function ReputationPanel({ onEditPlayer }: ReputationPanelProps) {
  const ranking = useScheduleStore((s) => s.getReputationRanking())
  const getPlayerById = useScheduleStore((s) => s.getPlayerById)
  const getRecordsForPlayer = useScheduleStore((s) => s.getRecordsForPlayer)
  const getSessionById = useScheduleStore((s) => s.getSessionById)

  const stablePlayers = ranking.filter((r) => !r.needConfirm && r.stats.totalSessions > 0).slice(0, 5)
  const needConfirmPlayers = ranking.filter((r) => r.needConfirm)
  const newPlayers = ranking.filter((r) => r.stats.totalSessions === 0)

  const renderPlayerRow = (item: typeof ranking[number]) => {
    const player = getPlayerById(item.playerId)
    if (!player) return null
    const recentRecords = getRecordsForPlayer(item.playerId).slice(0, 3)

    return (
      <div
        key={item.playerId}
        onClick={() => onEditPlayer(player)}
        className={`p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
          item.needConfirm
            ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
            : item.stats.totalSessions === 0
            ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            : 'bg-white border-board-border hover:bg-gray-50'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-board-text truncate">{player.nickname}</span>
              {item.needConfirm && (
                <AlertTriangle className="w-3 h-3 text-board-danger shrink-0" />
              )}
            </div>
            {player.preferenceTypes.length > 0 && (
              <div className="text-[10px] text-board-muted mt-0.5 truncate">
                {player.preferenceTypes.slice(0, 2).join('·')}
              </div>
            )}
          </div>
          <div className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${getScoreColor(item.reliabilityScore)} ${getScoreBg(item.reliabilityScore)} border`}>
            {item.reliabilityScore}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] text-board-muted mb-1.5">
          <span>共{item.stats.totalSessions}场</span>
          {item.stats.onTimeCount > 0 && (
            <span className="text-emerald-600">准{item.stats.onTimeCount}</span>
          )}
          {item.stats.lateCount > 0 && (
            <span className="text-amber-600">迟{item.stats.lateCount}{item.stats.avgLateMinutes > 0 ? `(均${item.stats.avgLateMinutes}分)` : ''}</span>
          )}
          {item.stats.noShowCount > 0 && (
            <span className="text-board-danger">爽约{item.stats.noShowCount}</span>
          )}
          {item.stats.canceledCount > 0 && (
            <span className="text-gray-500">取消{item.stats.canceledCount}</span>
          )}
          {item.stats.positiveCount > 0 && (
            <span className="text-sky-600">好评{item.stats.positiveCount}</span>
          )}
        </div>

        {recentRecords.length > 0 && (
          <div className="flex items-center gap-1 pt-1 border-t border-dashed border-gray-200">
            <span className="text-[9px] text-gray-400 shrink-0">近3次</span>
            {recentRecords.map((r) => {
              const session = getSessionById(r.sessionId)
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-0.5 shrink-0"
                  title={`${session?.scriptName || ''} · ${ATTENDANCE_LABELS[r.attendance]}${r.lateMinutes ? ` 迟${r.lateMinutes}分` : ''}`}
                >
                  {getAttendanceIcon(r.attendance)}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-board-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-board-accent" />
            <h2 className="text-xs font-semibold text-board-text uppercase tracking-wider">玩家信誉</h2>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-board-muted">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>稳定 {stablePlayers.length}</span>
            <span className="mx-1 opacity-40">·</span>
            <TrendingDown className="w-3 h-3 text-board-danger" />
            <span>待确认 {needConfirmPlayers.length}</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          基于最近5次复盘汇总计算，点击查看完整资料
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {needConfirmPlayers.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 px-0.5">
              <AlertTriangle className="w-3 h-3 text-board-danger" />
              <span className="text-[10px] font-medium text-board-danger uppercase tracking-wider">
                需提前确认 ({needConfirmPlayers.length})
              </span>
            </div>
            <div className="space-y-2">
              {needConfirmPlayers.map(renderPlayerRow)}
            </div>
          </div>
        )}

        {stablePlayers.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 px-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">
                稳定靠谱 ({stablePlayers.length})
              </span>
            </div>
            <div className="space-y-2">
              {stablePlayers.map(renderPlayerRow)}
            </div>
          </div>
        )}

        {newPlayers.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 px-0.5">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-medium text-board-muted uppercase tracking-wider">
                待观察 ({newPlayers.length})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {newPlayers.slice(0, 8).map((item) => {
                const player = getPlayerById(item.playerId)
                if (!player) return null
                return (
                  <div
                    key={item.playerId}
                    onClick={() => onEditPlayer(player)}
                    className="p-2 rounded-lg border border-gray-200 bg-gray-50 text-[11px] text-board-muted hover:bg-gray-100 cursor-pointer transition-colors truncate"
                  >
                    {player.nickname}
                  </div>
                )
              })}
              {newPlayers.length > 8 && (
                <div className="p-2 rounded-lg text-[10px] text-gray-400 text-center">
                  还有{newPlayers.length - 8}人
                </div>
              )}
            </div>
          </div>
        )}

        {ranking.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-board-muted mb-1">暂无信誉数据</p>
            <p className="text-xs text-gray-400">完成几车复盘后即可看到信誉统计</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useScheduleStore } from '@/store/scheduleStore'
import type { Session, Player, Hint, DragData } from '@/types'
import Toolbar from '@/components/Toolbar'
import SessionPanel, { type SessionFilter } from '@/components/SessionPanel'
import PlayerPanel from '@/components/PlayerPanel'
import ConflictPanel from '@/components/ConflictPanel'
import ReputationPanel from '@/components/ReputationPanel'
import PlayerCard from '@/components/PlayerCard'
import SessionForm from '@/components/SessionForm'
import PlayerForm from '@/components/PlayerForm'
import ExportModal from '@/components/ExportModal'
import DebriefModal from '@/components/DebriefModal'

export default function Home() {
  const assignPlayer = useScheduleStore((s) => s.assignPlayer)
  const removePlayerFromSlot = useScheduleStore((s) => s.removePlayerFromSlot)
  const getHints = useScheduleStore((s) => s.getHints)
  const getPlayerById = useScheduleStore((s) => s.getPlayerById)
  const sessionSlots = useScheduleStore((s) => s.sessionSlots)

  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [editSession, setEditSession] = useState<Session | undefined>()
  const [editPlayer, setEditPlayer] = useState<Player | undefined>()
  const [showExport, setShowExport] = useState(false)
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null)
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null)
  const [overSlotId, setOverSlotId] = useState<string | null>(null)
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>({
    shop: null,
    dm: null,
    types: [],
  })
  const [rightTab, setRightTab] = useState<'players' | 'conflicts' | 'reputation'>('players')
  const [highlightSessionId, setHighlightSessionId] = useState<string | null>(null)
  const [highlightSlotId, setHighlightSlotId] = useState<string | null>(null)
  const [debriefSession, setDebriefSession] = useState<Session | undefined>()
  const [showDebrief, setShowDebrief] = useState(false)
  const [temporarilyVisibleSessionId, setTemporarilyVisibleSessionId] = useState<string | null>(null)

  const sessions = useScheduleStore((s) => s.sessions)
  const currentWeekKey = useScheduleStore((s) => s.currentWeekKey)
  const filteredSessionIds = sessions
    .filter((s) => s.weekKey === currentWeekKey)
    .filter((s) => {
      if (sessionFilter.shop && s.shopName !== sessionFilter.shop) return false
      if (sessionFilter.dm && s.dmName !== sessionFilter.dm) return false
      if (sessionFilter.types.length > 0 && !sessionFilter.types.some((t) => s.scriptTypes.includes(t))) return false
      return true
    })
    .map((s) => s.id)

  const displayFilteredIds = temporarilyVisibleSessionId
    ? Array.from(new Set([...filteredSessionIds, temporarilyVisibleSessionId]))
    : filteredSessionIds

  const activeHintSlotId = overSlotId || hoveredSlotId
  const activeHintSessionId = activeHintSlotId
    ? sessionSlots.find((s) => s.id === activeHintSlotId)?.sessionId
    : null

  const sessionHints: Record<string, Hint[]> = {}
  if (activeHintSlotId && activePlayerId && activeHintSessionId) {
    sessionHints[activeHintSessionId] = getHints(activePlayerId, activeHintSessionId, activeHintSlotId)
  }

  useEffect(() => {
    if (!temporarilyVisibleSessionId) return
    const t = setTimeout(() => {
      setTemporarilyVisibleSessionId(null)
    }, 4500)
    return () => clearTimeout(t)
  }, [temporarilyVisibleSessionId])

  useEffect(() => {
    if (!activeHintSlotId) return
    const t = setTimeout(() => {
      if (hoveredSlotId === activeHintSlotId) {
        setHoveredSlotId(null)
      }
      if (overSlotId === activeHintSlotId) {
        setOverSlotId(null)
      }
    }, 3500)
    return () => clearTimeout(t)
  }, [activeHintSlotId, hoveredSlotId, overSlotId])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined
    if (data?.type === 'player') {
      setActivePlayerId(data.playerId)
    }
  }, [])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over, active } = event
      const dragData = active.data.current as DragData | undefined
      if (!dragData || dragData.type !== 'player') return
      if (over && over.id.toString().startsWith('slot-')) {
        const slotId = over.id.toString().replace('slot-', '')
        setOverSlotId(slotId)
      } else {
        setOverSlotId(null)
      }
    },
    []
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over) {
        setActivePlayerId(null)
        setOverSlotId(null)
        return
      }

      const dragData = active.data.current as DragData | undefined
      const dropData = over.data.current as { type: string; slotId: string } | undefined

      if (dragData?.type === 'player' && dropData?.type === 'slot') {
        const playerId = dragData.playerId
        const slotId = dropData.slotId

        const slot = useScheduleStore.getState().sessionSlots.find((s) => s.id === slotId)
        if (slot && !slot.playerId) {
          assignPlayer(slotId, playerId)
        }
      }

      setActivePlayerId(null)
      setTimeout(() => setOverSlotId(null), 1500)
    },
    [assignPlayer]
  )

  const handleRemovePlayer = useCallback(
    (slotId: string) => {
      removePlayerFromSlot(slotId)
    },
    [removePlayerFromSlot]
  )

  const handleNewSession = useCallback(() => {
    setEditSession(undefined)
    setShowSessionForm(true)
  }, [])

  const handleEditSession = useCallback((session: Session) => {
    setEditSession(session)
    setShowSessionForm(true)
  }, [])

  const handleDebriefSession = useCallback((session: Session) => {
    setDebriefSession(session)
    setShowDebrief(true)
  }, [])

  const handleNewPlayer = useCallback(() => {
    setEditPlayer(undefined)
    setShowPlayerForm(true)
  }, [])

  const handleEditPlayer = useCallback((player: Player) => {
    setEditPlayer(player)
    setShowPlayerForm(true)
  }, [])

  const handlePlayerClick = useCallback(
    (playerId: string) => {
      const player = getPlayerById(playerId)
      if (player) {
        setEditPlayer(player)
        setShowPlayerForm(true)
      }
    },
    [getPlayerById]
  )

  const handleLocateSession = useCallback(
    (sessionId: string, playerId?: string, slotId?: string) => {
      setTemporarilyVisibleSessionId(sessionId)
      requestAnimationFrame(() => {
        const el = document.getElementById(`session-${sessionId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
      setHighlightSessionId(sessionId)
      setTimeout(() => setHighlightSessionId(null), 2500)
      if (slotId) {
        setHighlightSlotId(slotId)
        setTimeout(() => setHighlightSlotId(null), 3000)
      } else {
        setHighlightSlotId(null)
      }
    },
    []
  )

  const activePlayer = activePlayerId ? getPlayerById(activePlayerId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-board-bg">
        <Toolbar
          onNewSession={handleNewSession}
          onNewPlayer={handleNewPlayer}
          onExport={() => setShowExport(true)}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[58%] border-r border-board-border">
            <SessionPanel
              onNewSession={handleNewSession}
              onEditSession={handleEditSession}
              onDebriefSession={handleDebriefSession}
              sessionHints={sessionHints}
              onRemovePlayer={handleRemovePlayer}
              onPlayerClick={handlePlayerClick}
              onSlotHover={(sid) => {
                if (activePlayerId) setHoveredSlotId(sid)
              }}
              hoveredSlotId={activeHintSlotId}
              filter={sessionFilter}
              onFilterChange={setSessionFilter}
              highlightSessionId={highlightSessionId}
              highlightSlotId={highlightSlotId}
              forcedVisibleSessionId={temporarilyVisibleSessionId}
            />
          </div>
          <div className="w-[42%] flex flex-col">
            <div className="flex border-b border-board-border shrink-0">
              <button
                onClick={() => setRightTab('players')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  rightTab === 'players'
                    ? 'text-board-text border-b-2 border-board-accent'
                    : 'text-board-muted hover:text-board-text'
                }`}
              >
                玩家池
              </button>
              <button
                onClick={() => setRightTab('conflicts')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors relative ${
                  rightTab === 'conflicts'
                    ? 'text-board-text border-b-2 border-board-accent'
                    : 'text-board-muted hover:text-board-text'
                }`}
              >
                冲突提醒
              </button>
              <button
                onClick={() => setRightTab('reputation')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  rightTab === 'reputation'
                    ? 'text-board-text border-b-2 border-board-accent'
                    : 'text-board-muted hover:text-board-text'
                }`}
              >
                信誉看板
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {rightTab === 'players' && (
                <PlayerPanel
                  onAddPlayer={handleNewPlayer}
                  onEditPlayer={handleEditPlayer}
                />
              )}
              {rightTab === 'conflicts' && (
                <ConflictPanel
                  onLocateSession={handleLocateSession}
                  onEditPlayer={(pid) => {
                    const p = getPlayerById(pid)
                    if (p) {
                      setEditPlayer(p)
                      setShowPlayerForm(true)
                    }
                  }}
                />
              )}
              {rightTab === 'reputation' && (
                <ReputationPanel
                  onEditPlayer={handleEditPlayer}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activePlayer ? (
          <div className="w-40">
            <PlayerCard
              player={activePlayer}
              onEdit={() => {}}
              isAssigned={false}
            />
          </div>
        ) : null}
      </DragOverlay>

      {showSessionForm && (
        <SessionForm
          session={editSession}
          onClose={() => {
            setShowSessionForm(false)
            setEditSession(undefined)
          }}
        />
      )}

      {showPlayerForm && (
        <PlayerForm
          player={editPlayer}
          onClose={() => {
            setShowPlayerForm(false)
            setEditPlayer(undefined)
          }}
        />
      )}

      {showExport && <ExportModal onClose={() => setShowExport(false)} filterSessionIds={filteredSessionIds} />}

      {showDebrief && debriefSession && (
        <DebriefModal
          session={debriefSession}
          onClose={() => {
            setShowDebrief(false)
            setDebriefSession(undefined)
          }}
        />
      )}
    </DndContext>
  )
}

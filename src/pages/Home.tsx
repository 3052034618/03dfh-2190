import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useScheduleStore } from '@/store/scheduleStore'
import type { Session, Player, Hint, DragData } from '@/types'
import Toolbar from '@/components/Toolbar'
import SessionPanel from '@/components/SessionPanel'
import PlayerPanel from '@/components/PlayerPanel'
import PlayerCard from '@/components/PlayerCard'
import SessionForm from '@/components/SessionForm'
import PlayerForm from '@/components/PlayerForm'
import ExportModal from '@/components/ExportModal'

export default function Home() {
  const assignPlayer = useScheduleStore((s) => s.assignPlayer)
  const removePlayerFromSlot = useScheduleStore((s) => s.removePlayerFromSlot)
  const getHints = useScheduleStore((s) => s.getHints)
  const getPlayerById = useScheduleStore((s) => s.getPlayerById)

  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [editSession, setEditSession] = useState<Session | undefined>()
  const [editPlayer, setEditPlayer] = useState<Player | undefined>()
  const [showExport, setShowExport] = useState(false)
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null)
  const [sessionHints, setSessionHints] = useState<Record<string, Hint[]>>({})

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActivePlayerId(null)

      if (!over) return

      const dragData = active.data.current as DragData | undefined
      const dropData = over.data.current as { type: string; slotId: string } | undefined

      if (dragData?.type === 'player' && dropData?.type === 'slot') {
        const playerId = dragData.playerId
        const slotId = dropData.slotId

        const slot = useScheduleStore.getState().sessionSlots.find((s) => s.id === slotId)
        if (slot && !slot.playerId) {
          assignPlayer(slotId, playerId)

          const hints = getHints(playerId, slot.sessionId)
          if (hints.length > 0) {
            setSessionHints((prev) => ({
              ...prev,
              [slot.sessionId]: hints,
            }))
          }
        }
      }
    },
    [assignPlayer, getHints]
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

  const activePlayer = activePlayerId ? getPlayerById(activePlayerId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
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
              sessionHints={sessionHints}
              onRemovePlayer={handleRemovePlayer}
              onPlayerClick={handlePlayerClick}
            />
          </div>
          <div className="w-[42%]">
            <PlayerPanel
              onAddPlayer={handleNewPlayer}
              onEditPlayer={handleEditPlayer}
            />
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

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </DndContext>
  )
}

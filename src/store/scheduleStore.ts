import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, SessionSlot, Player, PlayRecord, Hint } from '@/types'

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getCurrentWeekKey(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

function createSeedData() {
  const players: Player[] = [
    { id: 'p1', nickname: '阿清', preferenceTypes: ['情感', '沉浸'], canStayUp: true, acceptCrossGender: true, lateNote: '', availableTimeSlots: ['周末晚间', '可熬夜场'] },
    { id: 'p2', nickname: '老王', preferenceTypes: ['硬核', '推理'], canStayUp: true, acceptCrossGender: false, lateNote: '经常迟到10分钟', availableTimeSlots: ['工作日晚间', '周末白天', '周末晚间'] },
    { id: 'p3', nickname: '小鹿', preferenceTypes: ['机制', '阵营'], canStayUp: false, acceptCrossGender: true, lateNote: '', availableTimeSlots: ['周末白天'] },
    { id: 'p4', nickname: '大白', preferenceTypes: ['恐怖', '欢乐'], canStayUp: true, acceptCrossGender: true, lateNote: '', availableTimeSlots: ['工作日晚间', '周末晚间', '可熬夜场'] },
    { id: 'p5', nickname: '阿May', preferenceTypes: ['情感', '欢乐'], canStayUp: false, acceptCrossGender: true, lateNote: '不玩恐怖', availableTimeSlots: ['周末白天', '周末晚间'] },
    { id: 'p6', nickname: '周周', preferenceTypes: ['硬核', '机制'], canStayUp: true, acceptCrossGender: false, lateNote: '', availableTimeSlots: ['周末晚间', '可熬夜场'] },
  ]

  const sessions: Session[] = [
    {
      id: 's1',
      scriptName: '病娇男孩的精分日记',
      playerStructure: '3男3女',
      estimatedDuration: 5,
      dmName: '阿文',
      shopName: '迷雾剧场',
      depositStatus: 'paid',
      weekKey: getCurrentWeekKey(),
      createdAt: Date.now(),
    },
    {
      id: 's2',
      scriptName: '年轮',
      playerStructure: '4男2女',
      estimatedDuration: 4,
      dmName: '小何',
      shopName: '入戏推理馆',
      depositStatus: 'partial',
      weekKey: getCurrentWeekKey(),
      createdAt: Date.now() + 1,
    },
  ]

  const sessionSlots: SessionSlot[] = [
    { id: 'sl1', sessionId: 's1', playerId: null, slotLabel: '1号位', requiredGender: 'male', slotIndex: 0 },
    { id: 'sl2', sessionId: 's1', playerId: null, slotLabel: '2号位', requiredGender: 'male', slotIndex: 1 },
    { id: 'sl3', sessionId: 's1', playerId: null, slotLabel: '3号位', requiredGender: 'male', slotIndex: 2 },
    { id: 'sl4', sessionId: 's1', playerId: null, slotLabel: '4号位', requiredGender: 'female', slotIndex: 3 },
    { id: 'sl5', sessionId: 's1', playerId: null, slotLabel: '5号位', requiredGender: 'female', slotIndex: 4 },
    { id: 'sl6', sessionId: 's1', playerId: null, slotLabel: '6号位', requiredGender: 'female', slotIndex: 5 },
    { id: 'sl7', sessionId: 's2', playerId: null, slotLabel: '1号位', requiredGender: 'male', slotIndex: 0 },
    { id: 'sl8', sessionId: 's2', playerId: null, slotLabel: '2号位', requiredGender: 'male', slotIndex: 1 },
    { id: 'sl9', sessionId: 's2', playerId: null, slotLabel: '3号位', requiredGender: 'male', slotIndex: 2 },
    { id: 'sl10', sessionId: 's2', playerId: null, slotLabel: '4号位', requiredGender: 'male', slotIndex: 3 },
    { id: 'sl11', sessionId: 's2', playerId: null, slotLabel: '5号位', requiredGender: 'female', slotIndex: 4 },
    { id: 'sl12', sessionId: 's2', playerId: null, slotLabel: '6号位', requiredGender: 'female', slotIndex: 5 },
  ]

  const playRecords: PlayRecord[] = [
    { id: 'r1', playerId: 'p1', scriptName: '溯源', scriptType: '情感', shopName: '迷雾剧场', playedAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { id: 'r2', playerId: 'p2', scriptName: '日暮归途', scriptType: '硬核', shopName: '入戏推理馆', playedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { id: 'r3', playerId: 'p3', scriptName: '孤城', scriptType: '机制', shopName: '迷雾剧场', playedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { id: 'r4', playerId: 'p4', scriptName: '第二十二条校规', scriptType: '恐怖', shopName: '诡境', playedAt: Date.now() - 7 * 24 * 60 * 60 * 1000 },
  ]

  return { players, sessions, sessionSlots, playRecords }
}

interface ScheduleStore {
  sessions: Session[]
  sessionSlots: SessionSlot[]
  players: Player[]
  playRecords: PlayRecord[]
  currentWeekKey: string

  addSession: (session: Omit<Session, 'id' | 'createdAt' | 'weekKey'> & { slotCount: number; slotGenders: string[] }) => void
  updateSession: (id: string, data: Partial<Session>) => void
  deleteSession: (id: string) => void

  addSlot: (slot: Omit<SessionSlot, 'id'>) => void
  assignPlayer: (slotId: string, playerId: string | null) => void
  removePlayerFromSlot: (slotId: string) => void

  addPlayer: (player: Omit<Player, 'id'>) => string
  updatePlayer: (id: string, data: Partial<Player>) => void
  deletePlayer: (id: string) => void

  addPlayRecord: (record: Omit<PlayRecord, 'id'>) => void
  deletePlayRecord: (id: string) => void

  getHints: (playerId: string, sessionId: string) => Hint[]
  getPlayerById: (id: string) => Player | undefined
  getSessionById: (id: string) => Session | undefined
  getSlotsForSession: (sessionId: string) => SessionSlot[]
  getRecentPlays: (playerId: string, limit?: number) => PlayRecord[]
  isPlayerAssignedThisWeek: (playerId: string) => boolean
  getPlayerAssignedSlot: (playerId: string) => SessionSlot | undefined
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      ...createSeedData(),
      currentWeekKey: getCurrentWeekKey(),

      addSession: (data) => {
        const id = genId()
        const weekKey = get().currentWeekKey
        const session: Session = {
          id,
          scriptName: data.scriptName,
          playerStructure: data.playerStructure,
          estimatedDuration: data.estimatedDuration,
          dmName: data.dmName,
          shopName: data.shopName,
          depositStatus: data.depositStatus,
          weekKey,
          createdAt: Date.now(),
        }
        const slots: SessionSlot[] = Array.from({ length: data.slotCount }, (_, i) => ({
          id: genId(),
          sessionId: id,
          playerId: null,
          slotLabel: `${i + 1}号位`,
          requiredGender: (data.slotGenders[i] || 'any') as 'male' | 'female' | 'any',
          slotIndex: i,
        }))
        set((state) => ({
          sessions: [...state.sessions, session],
          sessionSlots: [...state.sessionSlots, ...slots],
        }))
      },

      updateSession: (id, data) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...data } : s)),
        }))
      },

      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          sessionSlots: state.sessionSlots.filter((s) => s.sessionId !== id),
        }))
      },

      addSlot: (slot) => {
        set((state) => ({
          sessionSlots: [...state.sessionSlots, { ...slot, id: genId() }],
        }))
      },

      assignPlayer: (slotId, playerId) => {
        set((state) => ({
          sessionSlots: state.sessionSlots.map((s) => {
            if (s.id === slotId) return { ...s, playerId }
            if (s.playerId === playerId && playerId !== null) return { ...s, playerId: null }
            return s
          }),
        }))
      },

      removePlayerFromSlot: (slotId) => {
        set((state) => ({
          sessionSlots: state.sessionSlots.map((s) =>
            s.id === slotId ? { ...s, playerId: null } : s
          ),
        }))
      },

      addPlayer: (data) => {
        const id = genId()
        const player: Player = { id, ...data }
        set((state) => ({
          players: [...state.players, player],
        }))
        return id
      },

      updatePlayer: (id, data) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }))
      },

      deletePlayer: (id) => {
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
          sessionSlots: state.sessionSlots.map((s) =>
            s.playerId === id ? { ...s, playerId: null } : s
          ),
          playRecords: state.playRecords.filter((r) => r.playerId !== id),
        }))
      },

      addPlayRecord: (data) => {
        set((state) => ({
          playRecords: [...state.playRecords, { id: genId(), ...data }],
        }))
      },

      deletePlayRecord: (id) => {
        set((state) => ({
          playRecords: state.playRecords.filter((r) => r.id !== id),
        }))
      },

      getHints: (playerId, sessionId) => {
        const state = get()
        const player = state.players.find((p) => p.id === playerId)
        const session = state.sessions.find((s) => s.id === sessionId)
        if (!player || !session) return []

        const hints: Hint[] = []

        const recentPlays = state.playRecords.filter(
          (r) =>
            r.playerId === playerId &&
            Date.now() - r.playedAt < 7 * 24 * 60 * 60 * 1000
        )
        const sameShopSameType = recentPlays.find(
          (r) => r.shopName === session.shopName && r.scriptType && player.preferenceTypes.includes(r.scriptType)
        )
        if (sameShopSameType) {
          hints.push({
            type: 'info',
            message: `该玩家上周刚玩过同店同类型（${sameShopSameType.shopName}·${sameShopSameType.scriptType}）`,
          })
        }

        const slots = state.sessionSlots.filter((s) => s.sessionId === sessionId)
        const assignedPlayerIds = slots.filter((s) => s.playerId).map((s) => s.playerId!)
        const assignedPlayers = assignedPlayerIds.map((pid) => state.players.find((p) => p.id === pid)).filter(Boolean) as Player[]
        const filledCount = assignedPlayers.length
        const totalCount = slots.length

        if (filledCount < totalCount) {
          const emptySlots = slots.filter((s) => !s.playerId)
          const needsMechanic = emptySlots.some((s) => s.slotLabel.includes('机制'))
          const assignedTypes = assignedPlayers.flatMap((p) => p.preferenceTypes)
          const hasMechanic = assignedTypes.includes('机制')
          if (!hasMechanic && session.scriptName.includes('机制')) {
            hints.push({
              type: 'suggestion',
              message: `当前缺一名能吃机制的玩家`,
            })
          }
        }

        if (player.availableTimeSlots.length > 0) {
          const otherAssigned = state.sessionSlots.filter(
            (s) => s.playerId && s.playerId !== playerId && s.sessionId !== sessionId
          )
          for (const os of otherAssigned) {
            const otherSession = state.sessions.find((s) => s.id === os.sessionId)
            if (otherSession) {
              const otherPlayer = state.players.find((p) => p.id === os.playerId)
              if (otherPlayer && otherPlayer.availableTimeSlots.length > 0) {
                const overlap = player.availableTimeSlots.some((t) =>
                  otherPlayer.availableTimeSlots.includes(t)
                )
                if (!overlap) {
                  hints.push({
                    type: 'conflict',
                    message: `与${otherPlayer.nickname}时间不重合`,
                  })
                }
              }
            }
          }
        }

        const weekKey = state.currentWeekKey
        const alreadyInSession = state.sessionSlots.find(
          (s) => s.playerId === playerId && s.sessionId !== sessionId
        )
        if (alreadyInSession) {
          const otherSession = state.sessions.find((s) => s.id === alreadyInSession.sessionId)
          if (otherSession && otherSession.weekKey === weekKey) {
            hints.push({
              type: 'conflict',
              message: `该玩家本周已在「${otherSession.scriptName}」车局中`,
            })
          }
        }

        const targetSlot = slots.find((s) => !s.playerId)
        if (targetSlot && targetSlot.requiredGender !== 'any') {
          if (targetSlot.requiredGender === 'male' && player.preferenceTypes.includes('只玩女角')) {
            hints.push({
              type: 'suggestion',
              message: `该位置需要男性角色，但玩家偏好女角`,
            })
          }
          if (targetSlot.requiredGender === 'female' && player.preferenceTypes.includes('只玩男角')) {
            hints.push({
              type: 'suggestion',
              message: `该位置需要女性角色，但玩家偏好男角`,
            })
          }
        }

        if (player.lateNote) {
          hints.push({
            type: 'info',
            message: `迟到备注：${player.lateNote}`,
          })
        }

        return hints
      },

      getPlayerById: (id) => get().players.find((p) => p.id === id),
      getSessionById: (id) => get().sessions.find((s) => s.id === id),
      getSlotsForSession: (sessionId) =>
        get().sessionSlots.filter((s) => s.sessionId === sessionId).sort((a, b) => a.slotIndex - b.slotIndex),
      getRecentPlays: (playerId, limit = 3) =>
        get()
          .playRecords.filter((r) => r.playerId === playerId)
          .sort((a, b) => b.playedAt - a.playedAt)
          .slice(0, limit),
      isPlayerAssignedThisWeek: (playerId) => {
        const state = get()
        const weekKey = state.currentWeekKey
        const slot = state.sessionSlots.find((s) => s.playerId === playerId)
        if (!slot) return false
        const session = state.sessions.find((s) => s.id === slot.sessionId)
        return session?.weekKey === weekKey
      },
      getPlayerAssignedSlot: (playerId) =>
        get().sessionSlots.find((s) => s.playerId === playerId),
    }),
    {
      name: 'schedule-board-storage',
    }
  )
)

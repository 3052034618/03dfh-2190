import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, SessionSlot, Player, PlayRecord, Hint, TimePreference, SessionPlayerRecord } from '@/types'
import {
  DEFAULT_TIME_PREFERENCE,
  timePreferenceOverlaps,
  sessionTimeMatchesPreference,
  hasAnyTimePreference,
} from '@/types'

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

function availableSlotsToTimePreference(slots: string[]): TimePreference {
  const tp: TimePreference = { ...DEFAULT_TIME_PREFERENCE }
  if (slots.includes('工作日白天')) tp.weekdayDay = true
  if (slots.includes('工作日晚间')) tp.weekdayNight = true
  if (slots.includes('周末白天')) tp.weekendDay = true
  if (slots.includes('周末晚间')) tp.weekendNight = true
  if (slots.includes('可熬夜场')) tp.lateNight = true
  return tp
}

function createSeedData() {
  const players: Player[] = [
    {
      id: 'p1',
      nickname: '阿清',
      preferenceTypes: ['情感', '沉浸'],
      canStayUp: true,
      acceptCrossGender: true,
      lateNote: '',
      timePreference: { ...DEFAULT_TIME_PREFERENCE, weekendNight: true, lateNight: true, specificDays: { ...DEFAULT_TIME_PREFERENCE.specificDays!, saturday: true, sunday: true } },
      availableTimeSlots: ['周末晚间', '可熬夜场'],
    },
    {
      id: 'p2',
      nickname: '老王',
      preferenceTypes: ['硬核', '推理'],
      canStayUp: true,
      acceptCrossGender: false,
      lateNote: '经常迟到10分钟',
      timePreference: { ...DEFAULT_TIME_PREFERENCE, weekdayNight: true, weekendDay: true, weekendNight: true, specificDays: { ...DEFAULT_TIME_PREFERENCE.specificDays!, friday: true, saturday: true } },
      availableTimeSlots: ['工作日晚间', '周末白天', '周末晚间'],
    },
    {
      id: 'p3',
      nickname: '小鹿',
      preferenceTypes: ['机制', '阵营'],
      canStayUp: false,
      acceptCrossGender: true,
      lateNote: '',
      timePreference: { ...DEFAULT_TIME_PREFERENCE, weekendDay: true, specificDays: { ...DEFAULT_TIME_PREFERENCE.specificDays!, saturday: true } },
      availableTimeSlots: ['周末白天'],
    },
    {
      id: 'p4',
      nickname: '大白',
      preferenceTypes: ['恐怖', '欢乐'],
      canStayUp: true,
      acceptCrossGender: true,
      lateNote: '',
      timePreference: { ...DEFAULT_TIME_PREFERENCE, weekdayNight: true, weekendNight: true, lateNight: true, specificDays: { ...DEFAULT_TIME_PREFERENCE.specificDays!, friday: true, saturday: true } },
      availableTimeSlots: ['工作日晚间', '周末晚间', '可熬夜场'],
    },
    {
      id: 'p5',
      nickname: '阿May',
      preferenceTypes: ['情感', '欢乐'],
      canStayUp: false,
      acceptCrossGender: true,
      lateNote: '不玩恐怖',
      timePreference: { ...DEFAULT_TIME_PREFERENCE, weekendDay: true, weekendNight: true, specificDays: { ...DEFAULT_TIME_PREFERENCE.specificDays!, saturday: true, sunday: true } },
      availableTimeSlots: ['周末白天', '周末晚间'],
    },
    {
      id: 'p6',
      nickname: '周周',
      preferenceTypes: ['硬核', '机制'],
      canStayUp: true,
      acceptCrossGender: false,
      lateNote: '',
      timePreference: { ...DEFAULT_TIME_PREFERENCE, weekendNight: true, lateNight: true, specificDays: { ...DEFAULT_TIME_PREFERENCE.specificDays!, saturday: true } },
      availableTimeSlots: ['周末晚间', '可熬夜场'],
    },
  ]

  const sessions: Session[] = [
    {
      id: 's1',
      scriptName: '病娇男孩的精分日记',
      scriptTypes: ['恐怖', '硬核'],
      playerStructure: '3男3女',
      estimatedDuration: 5,
      dmName: '阿文',
      shopName: '迷雾剧场',
      depositStatus: 'paid',
      status: 'scheduled',
      sessionTime: { dayType: 'weekend', timeOfDay: 'night', dayOfWeek: 6 },
      weekKey: getCurrentWeekKey(),
      createdAt: Date.now(),
    },
    {
      id: 's2',
      scriptName: '孤城',
      scriptTypes: ['机制', '阵营'],
      playerStructure: '4男2女',
      estimatedDuration: 6,
      dmName: '小何',
      shopName: '入戏推理馆',
      depositStatus: 'partial',
      status: 'scheduled',
      sessionTime: { dayType: 'weekend', timeOfDay: 'day', dayOfWeek: 6 },
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

  const sessionPlayerRecords: SessionPlayerRecord[] = []

  return { players, sessions, sessionSlots, playRecords, sessionPlayerRecords }
}

function computeSessionHints(
  state: ScheduleStore,
  sessionId: string,
  hoverPlayerId?: string,
  excludeSlotId?: string
): Hint[] {
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session) return []

  const hints: Hint[] = []
  const sessionTypes = session.scriptTypes || []

  const slots = state.sessionSlots.filter((s) => s.sessionId === sessionId)
  const assignedSlots = slots.filter((s) => s.playerId && s.id !== excludeSlotId)
  const assignedPlayerIds = assignedSlots.map((s) => s.playerId!)
  const assignedPlayers = assignedPlayerIds
    .map((pid) => state.players.find((p) => p.id === pid))
    .filter(Boolean) as Player[]

  let playersToCheck = assignedPlayers
  let hoverTargetSlotId: string | undefined
  if (hoverPlayerId) {
    const hoverPlayer = state.players.find((p) => p.id === hoverPlayerId)
    if (hoverPlayer) {
      playersToCheck = [...assignedPlayers, hoverPlayer]
      const targetSlot = slots.find((s) => s.id === excludeSlotId)
      if (targetSlot) hoverTargetSlotId = targetSlot.id
    }
  }

  if (sessionTypes.includes('机制')) {
    const hasMechanicPlayer = playersToCheck.some((p) => p.preferenceTypes.includes('机制'))
    if (!hasMechanicPlayer) {
      hints.push({
        type: 'suggestion',
        message: '当前车局还缺一名能吃机制的玩家',
      })
    }
  }

  for (let i = 0; i < playersToCheck.length; i++) {
    const p = playersToCheck[i]
    for (let j = i + 1; j < playersToCheck.length; j++) {
      const other = playersToCheck[j]
      if (!timePreferenceOverlaps(p.timePreference, other.timePreference)) {
        const isHover = hoverPlayerId && (p.id === hoverPlayerId || other.id === hoverPlayerId)
        const otherPlayer = p.id === hoverPlayerId ? other : p
        const targetSlot = isHover && hoverTargetSlotId ? hoverTargetSlotId : assignedSlots.find((s) => s.playerId === otherPlayer.id)?.id
        hints.push({
          type: 'conflict',
          message: isHover
            ? `与本车${otherPlayer.nickname}时间不重合`
            : `${p.nickname} 与 ${other.nickname} 时间不重合`,
          targetPlayerId: otherPlayer.id,
          targetSlotId: targetSlot,
        })
      }
    }
  }

  if (session.sessionTime) {
    for (const p of playersToCheck) {
      if (!sessionTimeMatchesPreference(session.sessionTime, p.timePreference)) {
        const targetSlot = p.id === hoverPlayerId
          ? hoverTargetSlotId
          : assignedSlots.find((s) => s.playerId === p.id)?.id
        if (hoverPlayerId && p.id === hoverPlayerId) {
          hints.push({
            type: 'conflict',
            message: '该玩家时间与车局时段不匹配',
            targetPlayerId: p.id,
            targetSlotId: targetSlot,
          })
        } else if (!hoverPlayerId) {
          hints.push({
            type: 'conflict',
            message: `${p.nickname}的时间与车局时段不匹配`,
            targetPlayerId: p.id,
            targetSlotId: targetSlot,
          })
        }
      }
    }
  }

  if (session.estimatedDuration >= 6) {
    for (const p of playersToCheck) {
      if (!p.canStayUp) {
        const targetSlot = p.id === hoverPlayerId
          ? hoverTargetSlotId
          : assignedSlots.find((s) => s.playerId === p.id)?.id
        if (hoverPlayerId && p.id === hoverPlayerId) {
          hints.push({
            type: 'conflict',
            message: `本车预计${session.estimatedDuration}h，该玩家不能熬夜`,
            targetPlayerId: p.id,
            targetSlotId: targetSlot,
          })
        } else if (!hoverPlayerId) {
          hints.push({
            type: 'conflict',
            message: `${p.nickname}不能熬夜，本车预计${session.estimatedDuration}h`,
            targetPlayerId: p.id,
            targetSlotId: targetSlot,
          })
        }
      }
    }
  }

  const allPlayersToCheck = hoverPlayerId
    ? [...assignedPlayers, state.players.find((p) => p.id === hoverPlayerId)].filter(Boolean) as Player[]
    : assignedPlayers

  for (const p of allPlayersToCheck) {
    const recentPlays = state.playRecords.filter(
      (r) =>
        r.playerId === p.id &&
        Date.now() - r.playedAt < 14 * 24 * 60 * 60 * 1000
    )
    const sameShopSameType = recentPlays.find((r) => {
      if (r.shopName !== session.shopName) return false
      if (!r.scriptType) return false
      return sessionTypes.includes(r.scriptType)
    })
    if (sameShopSameType) {
      const targetSlot = p.id === hoverPlayerId
        ? hoverTargetSlotId
        : assignedSlots.find((s) => s.playerId === p.id)?.id
      const daysAgo = Math.floor((Date.now() - sameShopSameType.playedAt) / (24 * 60 * 60 * 1000))
      hints.push({
        type: 'info',
        message: hoverPlayerId && p.id === hoverPlayerId
          ? `该玩家${daysAgo}天前刚玩过同店同类型（${sameShopSameType.shopName}·${sameShopSameType.scriptType}）`
          : `${p.nickname} ${daysAgo}天前刚玩过同店同类型（${sameShopSameType.shopName}·${sameShopSameType.scriptType}）`,
        targetPlayerId: p.id,
        targetSlotId: targetSlot,
      })
    }
  }

  if (hoverPlayerId) {
    const player = state.players.find((p) => p.id === hoverPlayerId)
    if (player) {
      if (sessionTypes.length > 0 && !player.preferenceTypes.some((pt) => sessionTypes.includes(pt))) {
        hints.push({
          type: 'info',
          message: `该玩家偏好类型与本车（${sessionTypes.join('/')}）不太匹配`,
          targetPlayerId: hoverPlayerId,
          targetSlotId: hoverTargetSlotId,
        })
      }

      if (player.lateNote) {
        hints.push({
          type: 'info',
          message: `迟到备注：${player.lateNote}`,
          targetPlayerId: hoverPlayerId,
          targetSlotId: hoverTargetSlotId,
        })
      }

      const records = state.sessionPlayerRecords.filter((r) => r.playerId === hoverPlayerId)
      const noShowCount = records.filter((r) => r.attendance === 'no-show').length
      const lateRecords = records.filter((r) => r.attendance === 'late')
      const avgLate = lateRecords.length > 0
        ? Math.round(lateRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0) / lateRecords.length)
        : 0
      if (noShowCount > 0) {
        hints.push({
          type: 'conflict',
          message: `历史爽约 ${noShowCount} 次，请注意`,
          targetPlayerId: hoverPlayerId,
          targetSlotId: hoverTargetSlotId,
        })
      }
      if (avgLate >= 15) {
        hints.push({
          type: 'suggestion',
          message: `历史平均迟到 ${avgLate} 分钟`,
          targetPlayerId: hoverPlayerId,
          targetSlotId: hoverTargetSlotId,
        })
      }
    }
  } else {
    for (const p of assignedPlayers) {
      const records = state.sessionPlayerRecords.filter((r) => r.playerId === p.id)
      const noShowCount = records.filter((r) => r.attendance === 'no-show').length
      const lateRecords = records.filter((r) => r.attendance === 'late')
      const avgLate = lateRecords.length > 0
        ? Math.round(lateRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0) / lateRecords.length)
        : 0
      const targetSlot = assignedSlots.find((s) => s.playerId === p.id)?.id
      if (noShowCount > 0) {
        hints.push({
          type: 'info',
          message: `${p.nickname} 历史爽约 ${noShowCount} 次`,
          targetPlayerId: p.id,
          targetSlotId: targetSlot,
        })
      }
      if (avgLate >= 15) {
        hints.push({
          type: 'info',
          message: `${p.nickname} 历史平均迟到 ${avgLate} 分钟`,
          targetPlayerId: p.id,
          targetSlotId: targetSlot,
        })
      }
    }
  }

  return hints
}

interface ScheduleStore {
  sessions: Session[]
  sessionSlots: SessionSlot[]
  players: Player[]
  playRecords: PlayRecord[]
  sessionPlayerRecords: SessionPlayerRecord[]
  currentWeekKey: string

  addSession: (session: Omit<Session, 'id' | 'createdAt' | 'weekKey' | 'status'> & { slotCount: number; slotGenders: string[] }) => void
  updateSession: (id: string, data: Partial<Session>) => void
  deleteSession: (id: string) => void
  setSessionStatus: (id: string, status: Session['status']) => void

  addSlot: (slot: Omit<SessionSlot, 'id'>) => void
  assignPlayer: (slotId: string, playerId: string | null) => void
  removePlayerFromSlot: (slotId: string) => void

  addPlayer: (player: Omit<Player, 'id'>) => string
  updatePlayer: (id: string, data: Partial<Player>) => void
  deletePlayer: (id: string) => void

  addPlayRecord: (record: Omit<PlayRecord, 'id'>) => void
  deletePlayRecord: (id: string) => void

  addSessionPlayerRecord: (record: Omit<SessionPlayerRecord, 'id' | 'createdAt'>) => void
  updateSessionPlayerRecord: (id: string, data: Partial<SessionPlayerRecord>) => void
  deleteSessionPlayerRecord: (id: string) => void
  getRecordsForSession: (sessionId: string) => SessionPlayerRecord[]
  getRecordsForPlayer: (playerId: string) => SessionPlayerRecord[]
  getPlayerStats: (playerId: string) => {
    totalSessions: number
    onTimeCount: number
    lateCount: number
    noShowCount: number
    avgLateMinutes: number
  }

  getHints: (playerId: string, sessionId: string, excludeSlotId?: string) => Hint[]
  getAllSessionHints: (sessionId: string) => Hint[]
  getShops: () => string[]
  getDMs: () => string[]
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
          scriptTypes: data.scriptTypes || [],
          playerStructure: data.playerStructure,
          estimatedDuration: data.estimatedDuration,
          dmName: data.dmName,
          shopName: data.shopName,
          depositStatus: data.depositStatus,
          status: 'scheduled',
          sessionTime: data.sessionTime,
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
          sessionPlayerRecords: state.sessionPlayerRecords.filter((r) => r.sessionId !== id),
        }))
      },

      setSessionStatus: (id, status) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id
              ? { ...s, status, completedAt: status === 'played' ? Date.now() : s.completedAt }
              : s
          ),
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
        const player: Player = {
          id,
          timePreference: { ...DEFAULT_TIME_PREFERENCE },
          availableTimeSlots: [],
          ...data,
        }
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
          playRecords: state.playRecords.filter((r) => r.playerId === id),
          sessionPlayerRecords: state.sessionPlayerRecords.filter((r) => r.playerId !== id),
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

      addSessionPlayerRecord: (data) => {
        set((state) => ({
          sessionPlayerRecords: [...state.sessionPlayerRecords, { id: genId(), createdAt: Date.now(), ...data }],
        }))
      },

      updateSessionPlayerRecord: (id, data) => {
        set((state) => ({
          sessionPlayerRecords: state.sessionPlayerRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        }))
      },

      deleteSessionPlayerRecord: (id) => {
        set((state) => ({
          sessionPlayerRecords: state.sessionPlayerRecords.filter((r) => r.id !== id),
        }))
      },

      getRecordsForSession: (sessionId) =>
        get().sessionPlayerRecords.filter((r) => r.sessionId === sessionId),

      getRecordsForPlayer: (playerId) =>
        get().sessionPlayerRecords.filter((r) => r.playerId === playerId),

      getPlayerStats: (playerId) => {
        const records = get().sessionPlayerRecords.filter((r) => r.playerId === playerId)
        const totalSessions = records.length
        const onTimeCount = records.filter((r) => r.attendance === 'on-time').length
        const lateCount = records.filter((r) => r.attendance === 'late').length
        const noShowCount = records.filter((r) => r.attendance === 'no-show').length
        const lateRecords = records.filter((r) => r.attendance === 'late')
        const avgLateMinutes = lateRecords.length > 0
          ? Math.round(lateRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0) / lateRecords.length)
          : 0
        return { totalSessions, onTimeCount, lateCount, noShowCount, avgLateMinutes }
      },

      getHints: (playerId, sessionId, excludeSlotId) => {
        return computeSessionHints(get(), sessionId, playerId, excludeSlotId)
      },

      getAllSessionHints: (sessionId) => {
        return computeSessionHints(get(), sessionId)
      },

      getShops: () => {
        const shops = new Set(get().sessions.map((s) => s.shopName).filter(Boolean))
        return Array.from(shops).sort()
      },

      getDMs: () => {
        const dms = new Set(get().sessions.map((s) => s.dmName).filter(Boolean))
        return Array.from(dms).sort()
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
      version: 3,
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as ScheduleStore
        if (version < 2 && state.players) {
          state.players = state.players.map((p) => ({
            ...p,
            timePreference: p.timePreference || availableSlotsToTimePreference(p.availableTimeSlots || []),
          }))
        }
        if (version < 3) {
          if (state.sessions) {
            state.sessions = state.sessions.map((s) => ({
              ...s,
              status: (s as any).status || 'scheduled',
            }))
          }
          if (state.players) {
            state.players = state.players.map((p) => ({
              ...p,
              timePreference: {
                ...DEFAULT_TIME_PREFERENCE,
                ...(p.timePreference || {}),
                specificDays: {
                  ...DEFAULT_TIME_PREFERENCE.specificDays!,
                  ...((p.timePreference as any)?.specificDays || {}),
                },
              },
            }))
          }
          if (!state.sessionPlayerRecords) {
            state.sessionPlayerRecords = []
          }
        }
        return persistedState
      },
    }
  )
)

export interface Session {
  id: string
  scriptName: string
  scriptTypes: string[]
  playerStructure: string
  estimatedDuration: number
  dmName: string
  shopName: string
  depositStatus: 'paid' | 'unpaid' | 'partial'
  sessionTime?: SessionTime
  weekKey: string
  createdAt: number
}

export interface SessionTime {
  dayType: 'weekday' | 'weekend' | 'any'
  timeOfDay: 'day' | 'night' | 'late' | 'any'
  date?: string
  startTime?: string
}

export interface SessionSlot {
  id: string
  sessionId: string
  playerId: string | null
  slotLabel: string
  requiredGender: 'male' | 'female' | 'any'
  slotIndex: number
}

export interface TimePreference {
  weekdayDay: boolean
  weekdayNight: boolean
  weekendDay: boolean
  weekendNight: boolean
  lateNight: boolean
}

export interface Player {
  id: string
  nickname: string
  preferenceTypes: string[]
  canStayUp: boolean
  acceptCrossGender: boolean
  lateNote: string
  timePreference: TimePreference
  availableTimeSlots: string[]
}

export interface PlayRecord {
  id: string
  playerId: string
  scriptName: string
  scriptType: string
  shopName: string
  playedAt: number
}

export interface Hint {
  type: 'conflict' | 'suggestion' | 'info'
  message: string
  targetPlayerId?: string
  targetSlotId?: string
}

export type DragData = {
  type: 'player'
  playerId: string
}

export const SCRIPT_TYPES = [
  '情感',
  '硬核',
  '机制',
  '恐怖',
  '欢乐',
  '阵营',
  '推理',
  '沉浸',
  '其他',
] as const

export const GENDER_LABELS: Record<string, string> = {
  male: '男',
  female: '女',
  any: '不限',
}

export const DEPOSIT_STATUS_LABELS: Record<string, string> = {
  paid: '已付',
  unpaid: '未付',
  partial: '部分',
}

export const DEFAULT_TIME_PREFERENCE: TimePreference = {
  weekdayDay: false,
  weekdayNight: false,
  weekendDay: false,
  weekendNight: false,
  lateNight: false,
}

export const TIME_PREFERENCE_LABELS: Record<keyof TimePreference, string> = {
  weekdayDay: '工作日白天',
  weekdayNight: '工作日晚间',
  weekendDay: '周末白天',
  weekendNight: '周末晚间',
  lateNight: '深夜场',
}

export function hasAnyTimePreference(tp: TimePreference): boolean {
  return tp.weekdayDay || tp.weekdayNight || tp.weekendDay || tp.weekendNight || tp.lateNight
}

export function timePreferenceOverlaps(a: TimePreference, b: TimePreference): boolean {
  const aHasAny = hasAnyTimePreference(a)
  const bHasAny = hasAnyTimePreference(b)
  if (!aHasAny || !bHasAny) return true
  if (a.weekdayDay && b.weekdayDay) return true
  if (a.weekdayNight && b.weekdayNight) return true
  if (a.weekendDay && b.weekendDay) return true
  if (a.weekendNight && b.weekendNight) return true
  if (a.lateNight && b.lateNight) return true
  return false
}

export function sessionTimeMatchesPreference(st: SessionTime | undefined, tp: TimePreference): boolean {
  if (!st || !hasAnyTimePreference(tp)) return true
  const isWeekend = st.dayType === 'weekend'
  const isWeekday = st.dayType === 'weekday'
  const isDay = st.timeOfDay === 'day'
  const isNight = st.timeOfDay === 'night'
  const isLate = st.timeOfDay === 'late'
  if (isLate) return tp.lateNight
  if (isWeekend && isDay) return tp.weekendDay
  if (isWeekend && isNight) return tp.weekendNight
  if (isWeekday && isDay) return tp.weekdayDay
  if (isWeekday && isNight) return tp.weekdayNight
  return true
}

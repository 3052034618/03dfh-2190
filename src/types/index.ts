export interface Session {
  id: string
  scriptName: string
  scriptTypes: string[]
  playerStructure: string
  estimatedDuration: number
  dmName: string
  shopName: string
  depositStatus: 'paid' | 'unpaid' | 'partial'
  status: 'scheduled' | 'played' | 'canceled'
  sessionTime?: SessionTime
  weekKey: string
  createdAt: number
  completedAt?: number
}

export interface SessionTime {
  dayType: 'weekday' | 'weekend' | 'any'
  timeOfDay: 'day' | 'night' | 'late' | 'any'
  dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
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

export type SpecificDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface TimePreference {
  weekdayDay: boolean
  weekdayNight: boolean
  weekendDay: boolean
  weekendNight: boolean
  lateNight: boolean
  specificDays?: Record<SpecificDayKey, boolean>
  preferredTimeRange?: string
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

export interface SessionPlayerRecord {
  id: string
  sessionId: string
  playerId: string
  slotId: string
  attendance: 'on-time' | 'late' | 'no-show' | 'canceled'
  lateMinutes?: number
  noShow?: boolean
  experienceNote?: string
  createdAt: number
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

export const SESSION_STATUS_LABELS: Record<string, string> = {
  scheduled: '待开',
  played: '已完成',
  canceled: '已取消',
}

export const ATTENDANCE_LABELS: Record<string, string> = {
  'on-time': '准时',
  'late': '迟到',
  'no-show': '爽约',
  'canceled': '临时取消',
}

export const WEEKDAY_LABELS: Record<string, string> = {
  monday: '周一',
  tuesday: '周二',
  wednesday: '周三',
  thursday: '周四',
  friday: '周五',
  saturday: '周六',
  sunday: '周日',
}

export const DAY_OF_WEEK_TO_KEY: Record<0 | 1 | 2 | 3 | 4 | 5 | 6, SpecificDayKey> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  0: 'sunday',
}

export const KEY_TO_DAY_OF_WEEK: Record<SpecificDayKey, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
}

export const DEFAULT_TIME_PREFERENCE: TimePreference = {
  weekdayDay: false,
  weekdayNight: false,
  weekendDay: false,
  weekendNight: false,
  lateNight: false,
  specificDays: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  },
  preferredTimeRange: '',
}

export const TIME_PREFERENCE_LABELS: Record<keyof Omit<TimePreference, 'specificDays' | 'preferredTimeRange'>, string> = {
  weekdayDay: '工作日白天',
  weekdayNight: '工作日晚间',
  weekendDay: '周末白天',
  weekendNight: '周末晚间',
  lateNight: '深夜场',
}

export function hasAnyTimePreference(tp: TimePreference): boolean {
  const coarse = tp.weekdayDay || tp.weekdayNight || tp.weekendDay || tp.weekendNight || tp.lateNight
  if (coarse) return true
  if (tp.specificDays) {
    const sd = tp.specificDays
    return sd.monday || sd.tuesday || sd.wednesday || sd.thursday || sd.friday || sd.saturday || sd.sunday
  }
  return false
}

export function hasSpecificDayPreference(tp: TimePreference): boolean {
  if (!tp.specificDays) return false
  const sd = tp.specificDays
  return sd.monday || sd.tuesday || sd.wednesday || sd.thursday || sd.friday || sd.saturday || sd.sunday
}

export function timePreferenceOverlaps(a: TimePreference, b: TimePreference): boolean {
  const aHasAny = hasAnyTimePreference(a)
  const bHasAny = hasAnyTimePreference(b)
  if (!aHasAny || !bHasAny) return true

  if (hasSpecificDayPreference(a) && hasSpecificDayPreference(b) && a.specificDays && b.specificDays) {
    const aDays = a.specificDays
    const bDays = b.specificDays
    const dayOverlap =
      (aDays.monday && bDays.monday) ||
      (aDays.tuesday && bDays.tuesday) ||
      (aDays.wednesday && bDays.wednesday) ||
      (aDays.thursday && bDays.thursday) ||
      (aDays.friday && bDays.friday) ||
      (aDays.saturday && bDays.saturday) ||
      (aDays.sunday && bDays.sunday)
    if (dayOverlap) return true
  }

  if (a.weekdayDay && b.weekdayDay) return true
  if (a.weekdayNight && b.weekdayNight) return true
  if (a.weekendDay && b.weekendDay) return true
  if (a.weekendNight && b.weekendNight) return true
  if (a.lateNight && b.lateNight) return true
  return false
}

export function sessionTimeMatchesPreference(st: SessionTime | undefined, tp: TimePreference): boolean {
  if (!st || !hasAnyTimePreference(tp)) return true

  if (st.dayOfWeek !== undefined && tp.specificDays && hasSpecificDayPreference(tp)) {
    const dayKey = DAY_OF_WEEK_TO_KEY[st.dayOfWeek]
    if (dayKey && !tp.specificDays[dayKey]) {
      return false
    }
  }

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

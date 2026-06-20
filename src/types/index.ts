export type TimeRangeKey = 'morning' | 'afternoon' | 'evening' | 'night' | 'late-night'

export const TIME_RANGE_LABELS: Record<TimeRangeKey, string> = {
  'morning': '上午 9-12',
  'afternoon': '下午 13-18',
  'evening': '傍晚 18-20',
  'night': '晚间 20-24',
  'late-night': '深夜 24+',
}

export interface DayTimeSlot {
  day: SpecificDayKey
  timeRanges: TimeRangeKey[]
}

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
  timeRange?: TimeRangeKey
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
  dayTimeSlots?: DayTimeSlot[]
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
  isPositiveFeedback?: boolean
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

export const WEEKDAY_LABELS: Record<SpecificDayKey, string> = {
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
  dayTimeSlots: [],
  preferredTimeRange: '',
}

export const TIME_PREFERENCE_LABELS: Record<keyof Omit<TimePreference, 'specificDays' | 'preferredTimeRange' | 'dayTimeSlots'>, string> = {
  weekdayDay: '工作日白天',
  weekdayNight: '工作日晚间',
  weekendDay: '周末白天',
  weekendNight: '周末晚间',
  lateNight: '深夜场',
}

export function hasAnyTimePreference(pref: TimePreference): boolean {
  return (
    pref.weekdayDay ||
    pref.weekdayNight ||
    pref.weekendDay ||
    pref.weekendNight ||
    pref.lateNight ||
    hasSpecificDayPreference(pref) ||
    hasDayTimeSlots(pref)
  )
}

export function hasSpecificDayPreference(pref: TimePreference): boolean {
  if (!pref.specificDays) return false
  return Object.values(pref.specificDays).some((v) => v)
}

export function hasDayTimeSlots(pref: TimePreference): boolean {
  return !!pref.dayTimeSlots && pref.dayTimeSlots.length > 0
}

export function timePreferenceOverlaps(a: TimePreference, b: TimePreference): boolean {
  if (!hasAnyTimePreference(a) || !hasAnyTimePreference(b)) return true

  if (hasDayTimeSlots(a) && hasDayTimeSlots(b)) {
    for (const sa of a.dayTimeSlots!) {
      for (const sb of b.dayTimeSlots!) {
        if (sa.day === sb.day && sa.timeRanges.some((r) => sb.timeRanges.includes(r))) {
          return true
        }
      }
    }
    if (hasSpecificDayPreference(a) || hasSpecificDayPreference(b) ||
        a.weekdayDay || a.weekdayNight || a.weekendDay || a.weekendNight || a.lateNight ||
        b.weekdayDay || b.weekdayNight || b.weekendDay || b.weekendNight || b.lateNight) {
      return fallbackGeneralOverlap(a, b)
    }
    return false
  }

  if (hasSpecificDayPreference(a) && hasSpecificDayPreference(b)) {
    const aDays = Object.keys(a.specificDays!).filter((k) => a.specificDays![k as SpecificDayKey])
    const bDays = Object.keys(b.specificDays!).filter((k) => b.specificDays![k as SpecificDayKey])
    if (aDays.some((d) => bDays.includes(d))) return true
  }

  return fallbackGeneralOverlap(a, b)
}

function fallbackGeneralOverlap(a: TimePreference, b: TimePreference): boolean {
  if (a.weekdayDay && b.weekdayDay) return true
  if (a.weekdayNight && b.weekdayNight) return true
  if (a.weekendDay && b.weekendDay) return true
  if (a.weekendNight && b.weekendNight) return true
  if (a.lateNight && b.lateNight) return true
  if (a.weekdayDay && b.weekendDay) return false
  if (a.weekdayNight && b.weekendNight) return false
  if (a.weekendDay && b.weekdayDay) return false
  if (a.weekendNight && b.weekdayNight) return false
  return false
}

export function sessionTimeMatchesPreference(st: SessionTime, tp: TimePreference): boolean {
  if (!hasAnyTimePreference(tp)) return true

  if (hasDayTimeSlots(tp) && st.dayOfWeek !== undefined && st.timeRange) {
    const dayKey = DAY_OF_WEEK_TO_KEY[st.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6]
    const matched = tp.dayTimeSlots!.some(
      (sl) => sl.day === dayKey && sl.timeRanges.includes(st.timeRange!)
    )
    if (matched) return true
  }

  if (st.dayOfWeek !== undefined && tp.specificDays && hasSpecificDayPreference(tp)) {
    const dayKey = DAY_OF_WEEK_TO_KEY[st.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6]
    if (tp.specificDays[dayKey]) return true
  }

  if (st.dayType === 'weekday' && st.timeOfDay === 'day' && tp.weekdayDay) return true
  if (st.dayType === 'weekday' && st.timeOfDay === 'night' && tp.weekdayNight) return true
  if (st.dayType === 'weekend' && st.timeOfDay === 'day' && tp.weekendDay) return true
  if (st.dayType === 'weekend' && st.timeOfDay === 'night' && tp.weekendNight) return true
  if (st.timeOfDay === 'late' && tp.lateNight) return true

  if (st.dayType === 'any' && st.timeOfDay === 'any') {
    return true
  }
  if (st.dayType === 'any') {
    if (st.timeOfDay === 'day' && (tp.weekdayDay || tp.weekendDay)) return true
    if (st.timeOfDay === 'night' && (tp.weekdayNight || tp.weekendNight)) return true
    if (st.timeOfDay === 'late' && tp.lateNight) return true
  }
  if (st.timeOfDay === 'any') {
    if (st.dayType === 'weekday' && (tp.weekdayDay || tp.weekdayNight)) return true
    if (st.dayType === 'weekend' && (tp.weekendDay || tp.weekendNight)) return true
  }

  return false
}

export function sessionsHaveTimeOverlap(st1: SessionTime, st2: SessionTime): boolean {
  if (st1.dayOfWeek !== undefined && st2.dayOfWeek !== undefined) {
    if (st1.dayOfWeek === st2.dayOfWeek) {
      if (st1.timeRange && st2.timeRange && st1.timeRange === st2.timeRange) return true
      if (st1.timeOfDay === st2.timeOfDay) return true
    }
  }

  if (st1.dayType !== 'any' && st2.dayType !== 'any' && st1.dayType !== st2.dayType) return false
  if (st1.timeOfDay !== 'any' && st2.timeOfDay !== 'any' && st1.timeOfDay !== st2.timeOfDay) return false

  if (st1.dayType !== 'any' && st2.dayType !== 'any') return true
  if (st1.timeOfDay !== 'any' && st2.timeOfDay !== 'any') return true
  if (st1.dayType === 'any' && st1.timeOfDay === 'any') return true
  if (st2.dayType === 'any' && st2.timeOfDay === 'any') return true

  return false
}

export interface Session {
  id: string
  scriptName: string
  scriptTypes: string[]
  playerStructure: string
  estimatedDuration: number
  dmName: string
  shopName: string
  depositStatus: 'paid' | 'unpaid' | 'partial'
  weekKey: string
  createdAt: number
}

export interface SessionSlot {
  id: string
  sessionId: string
  playerId: string | null
  slotLabel: string
  requiredGender: 'male' | 'female' | 'any'
  slotIndex: number
}

export interface Player {
  id: string
  nickname: string
  preferenceTypes: string[]
  canStayUp: boolean
  acceptCrossGender: boolean
  lateNote: string
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
}

export type DragData = {
  type: 'player'
  playerId: string
}

export const TIME_SLOT_OPTIONS = [
  '工作日白天', '工作日晚间', '周末白天', '周末晚间', '可熬夜场',
] as const

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

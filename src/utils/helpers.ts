import type { Hint } from '@/types'

const HINT_ICONS: Record<Hint['type'], string> = {
  conflict: '⚠',
  suggestion: '💡',
  info: '🔔',
}

const HINT_COLORS: Record<Hint['type'], string> = {
  conflict: 'bg-rose-50 border-rose-200 text-rose-700',
  suggestion: 'bg-amber-50 border-amber-200 text-amber-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
}

export function getHintIcon(type: Hint['type']): string {
  return HINT_ICONS[type]
}

export function getHintColor(type: Hint['type']): string {
  return HINT_COLORS[type]
}

export function getWeekDateRange(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(new Date().setDate(diff))
  const sunday = new Date(new Date().setDate(diff + 6))
  const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`
  return `${fmt(monday)} - ${fmt(sunday)}`
}

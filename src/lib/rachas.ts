import { AppState, DayEntry } from '../types'
import { bedtimeStatus } from './horaAcostarse'
import { porrosFueraDeRegla } from './porros'
import { parseISO, subDays, format, getDay } from 'date-fns'

function dateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function rachaMientras(
  entries: AppState['entries'],
  hoy: Date,
  cumple: (entry: DayEntry) => boolean
): number {
  let racha = 0
  let d = new Date(hoy)
  while (true) {
    const entry = entries[dateStr(d)]
    if (!entry) break
    if (!cumple(entry)) break
    racha++
    d = subDays(d, 1)
  }
  return racha
}

export function rachaCheckin(entries: AppState['entries'], hoy: Date): number {
  return rachaMientras(entries, hoy, () => true)
}

export function rachaNochesVerdes(entries: AppState['entries'], hoy: Date): number {
  return rachaMientras(entries, hoy, e => bedtimeStatus(e.horaAcostarse) === 'verde')
}

export function rachaSinCigarros(entries: AppState['entries'], hoy: Date): number {
  return rachaMientras(entries, hoy, e => e.cigarros === 0)
}

export function rachaLectura(entries: AppState['entries'], hoy: Date): number {
  return rachaMientras(entries, hoy, e => e.leyo)
}

export type ReglaId = 'acostarse' | 'cigarros' | 'porros'

function incumpleRegla(regla: ReglaId, entry: DayEntry): boolean {
  const date = parseISO(entry.date)
  if (regla === 'acostarse') return bedtimeStatus(entry.horaAcostarse) !== 'verde'
  if (regla === 'cigarros') {
    const diaSemana = getDay(date)
    const esFindeSemana = diaSemana === 0 || diaSemana === 6
    return !esFindeSemana && entry.cigarros > 0
  }
  return porrosFueraDeRegla(date, entry.porros)
}

// Días seguidos (hasta hoy) incumpliendo la misma regla — para la alerta del dashboard.
export function diasSeguidosIncumpliendo(
  entries: AppState['entries'],
  hoy: Date,
  regla: ReglaId
): number {
  let seguidos = 0
  let d = new Date(hoy)
  while (true) {
    const entry = entries[dateStr(d)]
    if (!entry || !incumpleRegla(regla, entry)) break
    seguidos++
    d = subDays(d, 1)
  }
  return seguidos
}

export const REGLAS: { id: ReglaId; label: string }[] = [
  { id: 'acostarse', label: 'acostarte tarde' },
  { id: 'cigarros', label: 'cigarros sueltos' },
  { id: 'porros', label: 'porros entre semana' },
]

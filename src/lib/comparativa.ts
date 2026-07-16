import { AppState, ComparativaSemana } from '../types'
import { startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, format, startOfMonth } from 'date-fns'

function dateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function semanaEntries(entries: AppState['entries'], semana: Date) {
  const inicio = startOfWeek(semana, { weekStartsOn: 1 })
  const fin = endOfWeek(semana, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: inicio, end: fin })
    .map(d => entries[dateStr(d)])
    .filter(Boolean)
}

export function calcularComparativa(
  entries: AppState['entries'],
  hoy: Date
): ComparativaSemana {
  const actual = semanaEntries(entries, hoy)
  const anterior = semanaEntries(entries, subWeeks(hoy, 1))

  const sum = (arr: typeof actual, fn: (e: NonNullable<(typeof arr)[0]>) => number) =>
    arr.reduce((acc, e) => acc + fn(e!), 0)

  const inicioMes = startOfMonth(hoy)
  const fiestasMes = Object.values(entries)
    .filter(e => {
      if (!e) return false
      const d = new Date(e.date)
      return d >= inicioMes && d <= hoy && e.nocheDefiesta
    }).length

  return {
    porros: {
      actual: sum(actual, e => e.porros),
      anterior: sum(anterior, e => e.porros),
    },
    gym: {
      actual: sum(actual, e => (e.entreno ? 1 : 0)),
      anterior: sum(anterior, e => (e.entreno ? 1 : 0)),
    },
    bar: {
      actual: sum(actual, e => (e.fueAlBar ? 1 : 0)),
      anterior: sum(anterior, e => (e.fueAlBar ? 1 : 0)),
    },
    lectura: {
      actual: sum(actual, e => (e.leyo ? 1 : 0)),
      anterior: sum(anterior, e => (e.leyo ? 1 : 0)),
    },
    fiestasMes,
  }
}

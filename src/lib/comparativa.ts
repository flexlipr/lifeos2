import { AppState, ComparativaSemana } from '../types'
import { minutosNormalizados } from './horaAcostarse'
import { startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, format } from 'date-fns'

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

function mediaAcostarse(arr: ReturnType<typeof semanaEntries>): number | null {
  const minutos = arr
    .map(e => minutosNormalizados(e!.horaAcostarse))
    .filter((m): m is number => m !== null)
  if (minutos.length === 0) return null
  return minutos.reduce((acc, m) => acc + m, 0) / minutos.length
}

export function calcularComparativa(
  entries: AppState['entries'],
  hoy: Date
): ComparativaSemana {
  const actual = semanaEntries(entries, hoy)
  const anterior = semanaEntries(entries, subWeeks(hoy, 1))

  const sum = (arr: typeof actual, fn: (e: NonNullable<(typeof arr)[0]>) => number) =>
    arr.reduce((acc, e) => acc + fn(e!), 0)

  return {
    acostarseMedia: {
      actual: mediaAcostarse(actual),
      anterior: mediaAcostarse(anterior),
    },
    gym: {
      actual: sum(actual, e => (e.entreno ? 1 : 0)),
      anterior: sum(anterior, e => (e.entreno ? 1 : 0)),
    },
    cigarros: {
      actual: sum(actual, e => e.cigarros),
      anterior: sum(anterior, e => e.cigarros),
    },
    lectura: {
      actual: sum(actual, e => (e.leyo ? 1 : 0)),
      anterior: sum(anterior, e => (e.leyo ? 1 : 0)),
    },
  }
}

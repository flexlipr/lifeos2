import { AppState } from '../types'
import { evaluarPorros } from './fases'
import { parseISO, subDays, format } from 'date-fns'

function dateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function rachaCheckin(entries: AppState['entries'], hoy: Date): number {
  let racha = 0
  let d = new Date(hoy)
  while (true) {
    const key = dateStr(d)
    if (!entries[key]) break
    racha++
    d = subDays(d, 1)
  }
  return racha
}

export function rachaPorrosDentroFase(entries: AppState['entries'], hoy: Date): number {
  let racha = 0
  let d = new Date(hoy)
  while (true) {
    const key = dateStr(d)
    const entry = entries[key]
    if (!entry) break
    const estado = evaluarPorros(
      parseISO(entry.date),
      entry.porros,
      entry.porrosEscalonRazon,
      entry.porrosEscalonJustificado
    )
    if (estado === 'rojo') break
    racha++
    d = subDays(d, 1)
  }
  return racha
}

export function rachaLectura(entries: AppState['entries'], hoy: Date): number {
  let racha = 0
  let d = new Date(hoy)
  while (true) {
    const key = dateStr(d)
    const entry = entries[key]
    if (!entry) break
    if (!entry.leyo) break
    racha++
    d = subDays(d, 1)
  }
  return racha
}

export function diasSeguidos2Tope(entries: AppState['entries'], hoy: Date): number {
  let seguidos = 0
  let d = new Date(hoy)
  for (let i = 0; i < 2; i++) {
    const key = dateStr(subDays(d, i))
    const entry = entries[key]
    if (!entry) break
    const estado = evaluarPorros(
      parseISO(entry.date),
      entry.porros,
      entry.porrosEscalonRazon,
      entry.porrosEscalonJustificado
    )
    if (estado === 'rojo') seguidos++
    else break
  }
  return seguidos
}

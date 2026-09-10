import { SemaforoColor } from '../types'

const MINUTOS_DIA = 24 * 60
const LIMITE_VERDE = 23 * 60 // 23:00
const LIMITE_MEDIODIA = 12 * 60 // frontera para considerar "después de medianoche"

// Normaliza una hora 'HH:mm' a minutos, tratando las horas de madrugada (00:00-11:59)
// como una continuación de la noche anterior (24:00-35:59), para que ordenen y
// promedien correctamente como "tarde" en vez de "temprano".
export function minutosNormalizados(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  const minutos = h * 60 + m
  return minutos < LIMITE_MEDIODIA ? minutos + MINUTOS_DIA : minutos
}

export function formatMinutosNormalizados(minutos: number): string {
  const m = Math.round(minutos) % MINUTOS_DIA
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function bedtimeStatus(hora: string): SemaforoColor {
  const minutos = minutosNormalizados(hora)
  if (minutos <= LIMITE_VERDE) return 'verde'
  if (minutos < MINUTOS_DIA) return 'ambar' // hasta 00:00 exclusive
  return 'rojo' // 00:00 en adelante
}

export const PRESETS_ACOSTARSE = ['22:00', '22:30', '23:00', '23:30', '00:00']

import { SemaforoColor } from '../types'

const MINUTOS_DIA = 24 * 60
const LIMITE_VERDE = 23 * 60 // 23:00
const LIMITE_MEDIODIA = 12 * 60 // frontera para considerar "después de medianoche"

// Normaliza una hora 'HH:mm' a minutos, tratando las horas de madrugada (00:00-11:59)
// como una continuación de la noche anterior (24:00-35:59), para que ordenen y
// promedien correctamente como "tarde" en vez de "temprano".
// Devuelve null si no hay una hora válida (p.ej. entries del 2.0 sin este campo).
export function minutosNormalizados(hora: string | undefined | null): number | null {
  if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) return null
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

// Sin dato de hora (entries antiguas del 2.0) se trata como rojo: no rompe
// la app y no infla rachas con datos que no existen.
export function bedtimeStatus(hora: string | undefined | null): SemaforoColor {
  const minutos = minutosNormalizados(hora)
  if (minutos === null) return 'rojo'
  if (minutos <= LIMITE_VERDE) return 'verde'
  if (minutos < MINUTOS_DIA) return 'ambar' // hasta 00:00 exclusive
  return 'rojo' // 00:00 en adelante
}

export const PRESETS_ACOSTARSE = ['22:00', '22:30', '23:00', '23:30', '00:00']

import { Fase, FaseRegla } from '../types'
import { parseISO, isAfter, isBefore, isEqual, getDay } from 'date-fns'

export const FASES: Fase[] = [
  { nombre: 'Puente',     inicio: '2026-07-09', fin: '2026-07-15', regla: { tipo: 'tope', max: 3 } },
  { nombre: 'Escalón 1', inicio: '2026-07-16', fin: '2026-07-29', regla: { tipo: 'tope', max: 2 } },
  { nombre: 'Escalón 2', inicio: '2026-07-30', fin: '2026-08-12', regla: { tipo: 'tope', max: 1 } },
  { nombre: 'Escalón 3', inicio: '2026-08-13', fin: '2026-08-31', regla: { tipo: 'diasPermitidos', dias: [5, 6] } }, // 5=vie, 6=sab
  { nombre: 'Destino',   inicio: '2026-09-01', fin: null,         regla: { tipo: 'ocasional' } },
]

export function getFaseForDate(date: Date): Fase | null {
  for (const fase of FASES) {
    const inicio = parseISO(fase.inicio)
    const fin = fase.fin ? parseISO(fase.fin) : null
    const dentroDeInicio = isAfter(date, inicio) || isEqual(date, inicio)
    const dentroDeFin = fin === null || isBefore(date, fin) || isEqual(date, fin)
    if (dentroDeInicio && dentroDeFin) return fase
  }
  return null
}

export function getFaseActual(): Fase | null {
  return getFaseForDate(new Date())
}

export function diasParaSiguienteFase(hoy: Date): number | null {
  const faseActual = getFaseForDate(hoy)
  if (!faseActual || !faseActual.fin) return null
  const fin = parseISO(faseActual.fin)
  const diff = fin.getTime() - hoy.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function describeFaseRegla(regla: FaseRegla): string {
  if (regla.tipo === 'tope') return `máx ${regla.max}/día`
  if (regla.tipo === 'diasPermitidos') return 'solo vie y sáb'
  return 'ocasional'
}

export function evaluarPorros(
  date: Date,
  porros: number,
  razon?: string,
  justificado?: boolean
): 'ok' | 'ambar' | 'rojo' | 'escalon3' {
  const fase = getFaseForDate(date)
  if (!fase) return 'ok'

  const regla = fase.regla
  if (regla.tipo === 'ocasional') return 'ok'

  if (regla.tipo === 'tope') {
    return porros <= regla.max ? 'ok' : 'rojo'
  }

  if (regla.tipo === 'diasPermitidos') {
    const diaSemana = getDay(date) // 0=dom, 1=lun, ..., 5=vie, 6=sab
    const permitido = regla.dias.includes(diaSemana)
    if (permitido) return 'ok'
    if (porros === 0) return 'ok'
    // día no permitido con porros > 0
    if (justificado === true) return 'ambar'
    if (justificado === false) return 'rojo'
    return 'escalon3'
  }

  return 'ok'
}

import { DayEntry, SemaforoResult } from '../types'
import { bedtimeStatus } from './horaAcostarse'
import { porrosFueraDeRegla } from './porros'
import { parseISO, getDay } from 'date-fns'

export function calcularSemaforo(entry: DayEntry): SemaforoResult {
  const fallos: string[] = []
  const date = parseISO(entry.date)
  const diaSemana = getDay(date) // 0=dom, 1=lun ... 6=sab
  const esFindeSemana = diaSemana === 0 || diaSemana === 6

  const bedtime = bedtimeStatus(entry.horaAcostarse)
  if (bedtime === 'rojo') fallos.push(`Te acostaste muy tarde (${entry.horaAcostarse})`)
  else if (bedtime === 'ambar') fallos.push(`Te acostaste tarde (${entry.horaAcostarse})`)

  if (!esFindeSemana && entry.cigarros > 0) {
    fallos.push(`Cigarros entre semana: ${entry.cigarros}`)
  }

  if (porrosFueraDeRegla(date, entry.porros)) {
    fallos.push(`Porros fuera de regla (solo vie/sáb): ${entry.porros}`)
  }

  // La hora de acostarse es el dato central: si es rojo, el día es rojo.
  if (bedtime === 'rojo') {
    return { color: 'rojo', fallos }
  }

  let color: SemaforoResult['color']
  if (fallos.length === 0) color = 'verde'
  else if (fallos.length === 1) color = 'ambar'
  else color = 'rojo'

  return { color, fallos }
}

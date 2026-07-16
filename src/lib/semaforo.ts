import { DayEntry, SemaforoResult } from '../types'
import { evaluarPorros } from './fases'
import { parseISO, getDay } from 'date-fns'

export function calcularSemaforo(entry: DayEntry): SemaforoResult {
  const fallos: string[] = []
  const date = parseISO(entry.date)
  const diaSemana = getDay(date) // 0=dom, 1=lun ... 6=sab
  const esFindeSemana = diaSemana === 0 || diaSemana === 6

  const estadoPorros = evaluarPorros(
    date,
    entry.porros,
    entry.porrosEscalonRazon,
    entry.porrosEscalonJustificado
  )
  if (estadoPorros === 'rojo') fallos.push('Porros: pasaste el límite')
  if (estadoPorros === 'ambar') fallos.push(`Porros: fuera del escalón (${entry.porrosEscalonRazon ?? 'sin razón'})`)

  if (!esFindeSemana && entry.cigarros > 0) {
    fallos.push(`Cigarros entre semana: ${entry.cigarros}`)
  }

  if (entry.fueAlBar && entry.bebidasAlcohol > 2) {
    fallos.push(`Bar: ${entry.bebidasAlcohol} bebidas con alcohol (máx 2)`)
  }

  if (entry.nocheDefiesta && entry.copas > 2) {
    fallos.push(`Fiesta: ${entry.copas} copas (máx 2)`)
  }

  let color: SemaforoResult['color']
  if (fallos.length === 0) color = 'verde'
  else if (fallos.length === 1) color = 'ambar'
  else color = 'rojo'

  // Si el único fallo es ambar por escalón 3 justificado, forzar ambar
  if (estadoPorros === 'ambar' && fallos.length === 1) color = 'ambar'

  return { color, fallos }
}

import { Pesaje } from '../types'
import { startOfWeek, endOfWeek, parseISO } from 'date-fns'

export function pesajesOrdenados(pesajes: Pesaje[]): Pesaje[] {
  return [...pesajes].sort((a, b) => a.date.localeCompare(b.date))
}

export function ultimoPesaje(pesajes: Pesaje[]): Pesaje | null {
  const ordenados = pesajesOrdenados(pesajes)
  return ordenados.length > 0 ? ordenados[ordenados.length - 1] : null
}

export function diferenciaConAnterior(pesajes: Pesaje[]): number | null {
  const ordenados = pesajesOrdenados(pesajes)
  if (ordenados.length < 2) return null
  const ultimo = ordenados[ordenados.length - 1]
  const anterior = ordenados[ordenados.length - 2]
  return Math.round((ultimo.kg - anterior.kg) * 10) / 10
}

export function yaPesadoEstaSemana(pesajes: Pesaje[], hoy: Date): boolean {
  const inicio = startOfWeek(hoy, { weekStartsOn: 1 })
  const fin = endOfWeek(hoy, { weekStartsOn: 1 })
  return pesajes.some(p => {
    const d = parseISO(p.date)
    return d >= inicio && d <= fin
  })
}

// Regresión lineal simple sobre los puntos (x = índice temporal), para dibujar la tendencia.
export function tendenciaLineal(pesajes: Pesaje[]): { slope: number; intercept: number } | null {
  const ordenados = pesajesOrdenados(pesajes)
  const n = ordenados.length
  if (n < 2) return null

  const t0 = parseISO(ordenados[0].date).getTime()
  const xs = ordenados.map(p => (parseISO(p.date).getTime() - t0) / 86400000) // días desde el primer punto
  const ys = ordenados.map(p => p.kg)

  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0)
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0)

  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: sumY / n }

  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

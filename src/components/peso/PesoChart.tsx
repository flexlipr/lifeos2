import { Pesaje } from '../../types'
import { pesajesOrdenados, tendenciaLineal } from '../../lib/peso'
import { parseISO } from 'date-fns'

interface Props {
  pesajes: Pesaje[]
}

const WIDTH = 320
const HEIGHT = 180
const PAD_X = 12
const PAD_Y = 16

export function PesoChart({ pesajes }: Props) {
  const ordenados = pesajesOrdenados(pesajes)

  if (ordenados.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center text-zinc-600 text-sm">
        Sin datos de peso todavía
      </div>
    )
  }

  const t0 = parseISO(ordenados[0].date).getTime()
  const tMax = parseISO(ordenados[ordenados.length - 1].date).getTime()
  const diasRango = Math.max(1, (tMax - t0) / 86400000)

  const kgs = ordenados.map(p => p.kg)
  const kgMin = Math.min(...kgs)
  const kgMax = Math.max(...kgs)
  const rangoKg = Math.max(0.5, kgMax - kgMin)

  const x = (fecha: string) => {
    const dias = (parseISO(fecha).getTime() - t0) / 86400000
    return PAD_X + (dias / diasRango) * (WIDTH - PAD_X * 2)
  }
  const y = (kg: number) =>
    HEIGHT - PAD_Y - ((kg - kgMin) / rangoKg) * (HEIGHT - PAD_Y * 2)

  const puntos = ordenados.map(p => `${x(p.date)},${y(p.kg)}`).join(' ')

  const tendencia = tendenciaLineal(ordenados)
  let lineaTendencia: string | null = null
  if (tendencia) {
    const kgInicio = tendencia.intercept
    const kgFin = tendencia.intercept + tendencia.slope * diasRango
    lineaTendencia = `${x(ordenados[0].date)},${y(kgInicio)} ${x(ordenados[ordenados.length - 1].date)},${y(kgFin)}`
  }

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-[180px]">
      {lineaTendencia && (
        <polyline points={lineaTendencia} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
      )}
      <polyline points={puntos} fill="none" stroke="#22c55e" strokeWidth="2.5" />
      {ordenados.map(p => (
        <circle
          key={p.date}
          cx={x(p.date)}
          cy={y(p.kg)}
          r={p.fueraDeDia ? 3 : 3.5}
          fill={p.fueraDeDia ? '#f59e0b' : '#22c55e'}
        />
      ))}
    </svg>
  )
}

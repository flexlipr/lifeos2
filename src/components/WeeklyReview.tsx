import { useState } from 'react'
import { AppState } from '../types'
import { calcularComparativa } from '../lib/comparativa'
import { bedtimeStatus } from '../lib/horaAcostarse'
import { parseISO, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns'

interface Props {
  state: AppState
  todayStr: string
  onContinue: (respuesta: string) => void
}

export function WeeklyReview({ state, todayStr, onContinue }: Props) {
  const [respuesta, setRespuesta] = useState('')
  const hoy = parseISO(todayStr)
  const comp = calcularComparativa(state.entries, hoy)

  const inicio = startOfWeek(hoy, { weekStartsOn: 1 })
  const fin = endOfWeek(hoy, { weekStartsOn: 1 })
  const dias = eachDayOfInterval({ start: inicio, end: fin })
    .map(d => state.entries[format(d, 'yyyy-MM-dd')])
    .filter(Boolean)

  const gymCount = dias.filter(e => e!.entreno).length
  const nochesVerdes = dias.filter(e => bedtimeStatus(e!.horaAcostarse) === 'verde').length
  const cigarrosTotal = dias.reduce((acc, e) => acc + e!.cigarros, 0)
  const diasLectura = dias.filter(e => e!.leyo).length

  const fallos = [gymCount < 3, nochesVerdes < dias.length, cigarrosTotal > 0].filter(Boolean).length
  const color = fallos === 0 ? 'verde' : fallos === 1 ? 'ámbar' : 'roja'
  const colorClasses = {
    verde: { bg: 'bg-accent-green/20 border-accent-green/30', text: 'text-accent-green' },
    ámbar: { bg: 'bg-accent-amber/20 border-accent-amber/30', text: 'text-accent-amber' },
    roja: { bg: 'bg-accent-red/20 border-accent-red/30', text: 'text-accent-red' },
  }[color]

  const veredicto = `${gymCount}/3 gym · ${nochesVerdes} noches en verde · ${cigarrosTotal} cigarros · ${diasLectura} días de lectura`

  function handleContinue() {
    onContinue(respuesta.trim())
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-0 px-4 py-8 gap-6 overflow-y-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Resumen semanal</h2>
        <p className="text-zinc-500 text-sm">Domingo — semana cerrada</p>
      </div>

      <div className={`rounded-3xl p-5 text-center border ${colorClasses.bg}`}>
        <p className={`font-semibold text-base ${colorClasses.text} mb-1`}>Semana {color}</p>
        <p className="text-zinc-300 text-sm">{veredicto}</p>
      </div>

      <div className="bg-surface-1 rounded-2xl p-5">
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Comparativa</h3>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Gym', a: comp.gym.actual, b: comp.gym.anterior, suffix: '/3' },
            { label: 'Cigarros', a: comp.cigarros.actual, b: comp.cigarros.anterior },
            { label: 'Lectura', a: comp.lectura.actual, b: comp.lectura.anterior },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-zinc-400">{row.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">{row.a}{row.suffix ?? ''}</span>
                <span className="text-zinc-600 text-sm">vs {row.b}{row.suffix ?? ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-1 rounded-2xl p-5 flex flex-col gap-3">
        <label className="text-zinc-300 text-sm font-medium">¿Qué me hizo fallar esta semana?</label>
        <input
          type="text"
          value={respuesta}
          onChange={e => setRespuesta(e.target.value)}
          placeholder="Corto, una frase..."
          className="w-full bg-surface-2 border border-surface-3 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-accent-green/60"
        />
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-5 rounded-2xl bg-surface-2 text-white font-semibold text-lg active:bg-surface-3"
      >
        Al dashboard →
      </button>
    </div>
  )
}

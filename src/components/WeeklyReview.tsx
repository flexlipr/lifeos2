import { AppState, DayEntry } from '../types'
import { calcularComparativa } from '../lib/comparativa'
import { parseISO, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { evaluarPorros } from '../lib/fases'

interface Props {
  state: AppState
  todayStr: string
  onContinue: () => void
}

function veredicto(entries: Record<string, DayEntry>, semana: Date): string {
  const inicio = startOfWeek(semana, { weekStartsOn: 1 })
  const fin = endOfWeek(semana, { weekStartsOn: 1 })
  const dias = eachDayOfInterval({ start: inicio, end: fin })
    .map(d => entries[format(d, 'yyyy-MM-dd')])
    .filter(Boolean)

  const gymOk = dias.filter(e => e!.entreno).length >= 3
  const porroksOk = dias.every(e => {
    const est = evaluarPorros(parseISO(e!.date), e!.porros, e!.porrosEscalonRazon, e!.porrosEscalonJustificado)
    return est !== 'rojo'
  })
  const cigOk = dias.every(e => {
    const d = parseISO(e!.date)
    const dow = d.getDay()
    return dow === 0 || dow === 6 || e!.cigarros === 0
  })

  const partes: string[] = []
  partes.push(gymOk ? `${dias.filter(e => e!.entreno).length}/3 gym ✓` : `${dias.filter(e => e!.entreno).length}/3 gym ✗`)
  partes.push(porroksOk ? 'porros en fase ✓' : 'porros fuera de fase ✗')
  partes.push(cigOk ? '0 cigarros entre semana ✓' : 'cigarros entre semana ✗')

  const fallos = [!gymOk, !porroksOk, !cigOk].filter(Boolean).length
  const color = fallos === 0 ? 'verde' : fallos === 1 ? 'ámbar' : 'roja'

  return `Semana ${color}: ${partes.join(', ')}`
}

export function WeeklyReview({ state, todayStr, onContinue }: Props) {
  const hoy = parseISO(todayStr)
  const comp = calcularComparativa(state.entries, hoy)
  const v = veredicto(state.entries, hoy)
  const isVerde = v.startsWith('Semana verde')
  const isAmbar = v.startsWith('Semana ámbar')

  return (
    <div className="flex flex-col min-h-screen bg-surface-0 px-4 py-8 gap-6 overflow-y-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Resumen semanal</h2>
        <p className="text-zinc-500 text-sm">Domingo — semana cerrada</p>
      </div>

      <div className={`rounded-3xl p-5 text-center ${
        isVerde ? 'bg-accent-green/20 border border-accent-green/30' :
        isAmbar ? 'bg-accent-amber/20 border border-accent-amber/30' :
                  'bg-accent-red/20 border border-accent-red/30'
      }`}>
        <p className={`font-semibold text-base ${
          isVerde ? 'text-accent-green' : isAmbar ? 'text-accent-amber' : 'text-accent-red'
        }`}>
          {v}
        </p>
      </div>

      <div className="bg-surface-1 rounded-2xl p-5">
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Comparativa</h3>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Porros', a: comp.porros.actual, b: comp.porros.anterior },
            { label: 'Gym', a: comp.gym.actual, b: comp.gym.anterior, suffix: '/3' },
            { label: 'Bar', a: comp.bar.actual, b: comp.bar.anterior },
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

      <button
        onClick={onContinue}
        className="w-full py-5 rounded-2xl bg-surface-2 text-white font-semibold text-lg active:bg-surface-3"
      >
        Al dashboard →
      </button>
    </div>
  )
}

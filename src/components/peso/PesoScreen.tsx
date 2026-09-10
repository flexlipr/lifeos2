import { useState } from 'react'
import { AppState, Pesaje } from '../../types'
import { PesoChart } from './PesoChart'
import { ultimoPesaje, diferenciaConAnterior, yaPesadoEstaSemana } from '../../lib/peso'
import { format, getDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  state: AppState
  todayStr: string
  onAddPesaje: (pesaje: Pesaje) => void
  onBack: () => void
}

const MOTIVOS = ['Viaje', 'Resaca', 'Condiciones no comparables']

export function PesoScreen({ state, todayStr, onAddPesaje, onBack }: Props) {
  const [kgInput, setKgInput] = useState('')
  const [mostrarFueraDeDia, setMostrarFueraDeDia] = useState(false)
  const [motivo, setMotivo] = useState('')

  const hoy = new Date(todayStr)
  const esMartes = getDay(hoy) === 2
  const yaPesado = yaPesadoEstaSemana(state.pesajes, hoy)
  const ultimo = ultimoPesaje(state.pesajes)
  const diferencia = diferenciaConAnterior(state.pesajes)

  function registrar(fueraDeDia: boolean) {
    const kg = parseFloat(kgInput.replace(',', '.'))
    if (isNaN(kg) || kg <= 0) return
    if (fueraDeDia && !motivo.trim()) return
    onAddPesaje({
      date: todayStr,
      kg,
      fueraDeDia: fueraDeDia || undefined,
      motivo: fueraDeDia ? motivo.trim() : undefined,
    })
    setKgInput('')
    setMotivo('')
    setMostrarFueraDeDia(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <div className="px-4 pt-safe-top pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 text-xl px-1">←</button>
        <h1 className="text-xl font-bold text-white">Peso</h1>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-4 overflow-y-auto pb-safe-bottom pb-6">
        {/* Último dato */}
        <div className="bg-surface-1 rounded-2xl p-5 flex items-center justify-around">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{ultimo ? `${ultimo.kg} kg` : '—'}</div>
            <div className="text-xs text-zinc-500 mt-1">último registro{ultimo ? ` · ${format(new Date(ultimo.date), "d MMM", { locale: es })}` : ''}</div>
          </div>
          {diferencia !== null && (
            <div className="text-center">
              <div className={`text-3xl font-bold ${diferencia < 0 ? 'text-accent-green' : diferencia > 0 ? 'text-accent-red' : 'text-zinc-400'}`}>
                {diferencia > 0 ? '+' : ''}{diferencia} kg
              </div>
              <div className="text-xs text-zinc-500 mt-1">vs anterior</div>
            </div>
          )}
        </div>

        {/* Gráfica */}
        <div className="bg-surface-1 rounded-2xl p-4">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 px-1">Evolución completa</h3>
          <PesoChart pesajes={state.pesajes} />
        </div>

        {/* Pesaje de hoy */}
        {esMartes && !yaPesado ? (
          <div className="bg-accent-green/10 border border-accent-green/30 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-accent-green text-sm font-semibold text-center">Hoy toca pesaje — en ayunas, después del baño</p>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="kg"
              value={kgInput}
              onChange={e => setKgInput(e.target.value)}
              className="w-full bg-surface-2 border border-surface-3 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none focus:border-accent-green/60"
            />
            <button
              onClick={() => registrar(false)}
              className="w-full py-4 rounded-xl bg-accent-green text-black font-bold active:opacity-80"
            >
              Registrar peso
            </button>
          </div>
        ) : yaPesado ? (
          <p className="text-zinc-600 text-sm text-center">Ya has registrado el pesaje de esta semana</p>
        ) : (
          <p className="text-zinc-600 text-sm text-center">El pesaje semanal es los martes</p>
        )}

        {/* Pesaje fuera de día */}
        {!mostrarFueraDeDia ? (
          <button
            onClick={() => setMostrarFueraDeDia(true)}
            className="text-zinc-600 text-xs underline self-center"
          >
            Pesaje fuera de día
          </button>
        ) : (
          <div className="bg-surface-1 border border-surface-3 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-zinc-400 text-sm text-center">Pesaje fuera de día — se marca como dato secundario</p>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="kg"
              value={kgInput}
              onChange={e => setKgInput(e.target.value)}
              className="w-full bg-surface-2 border border-surface-3 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-accent-amber/60"
            />
            <input
              type="text"
              placeholder="Motivo (ej: viaje, resaca...)"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className="w-full bg-surface-2 border border-surface-3 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-accent-amber/60"
            />
            <div className="flex gap-2 flex-wrap">
              {MOTIVOS.map(m => (
                <button
                  key={m}
                  onClick={() => setMotivo(m)}
                  className="px-3 py-1.5 rounded-full bg-surface-2 text-zinc-400 text-xs"
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setMostrarFueraDeDia(false); setMotivo(''); setKgInput('') }}
                className="flex-1 py-3 rounded-xl bg-surface-2 text-zinc-400 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => registrar(true)}
                className="flex-1 py-3 rounded-xl bg-accent-amber text-black text-sm font-bold"
              >
                Registrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

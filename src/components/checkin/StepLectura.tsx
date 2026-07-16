import { Toggle } from '../ui/Toggle'
import { DayEntry } from '../../types'

interface Props {
  entry: Partial<DayEntry>
  onChange: (fields: Partial<DayEntry>) => void
  librosTotales: number
}

export function StepLectura({ entry, onChange, librosTotales }: Props) {
  const leyo = entry.leyo ?? false
  const terminalLibro = entry.terminalLibro ?? false

  return (
    <div className="flex flex-col gap-5 py-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Lectura</h2>
        <p className="text-zinc-500 text-sm">Objetivo anual: ~1 libro/mes</p>
      </div>

      <Toggle
        label="Leí hoy"
        value={leyo}
        onChange={v => onChange({ leyo: v })}
      />

      <button
        onClick={() => onChange({ terminalLibro: !terminalLibro, leyo: true })}
        className={`w-full py-5 rounded-2xl border-2 transition-colors ${
          terminalLibro
            ? 'border-accent-green bg-accent-green/20 text-accent-green'
            : 'border-surface-3 bg-surface-2 text-zinc-400'
        }`}
      >
        <div className="text-3xl mb-1">{terminalLibro ? '🎉' : '📖'}</div>
        <div className="font-semibold text-lg">
          {terminalLibro ? '¡Libro terminado!' : 'Terminé un libro'}
        </div>
        {terminalLibro && (
          <div className="text-sm mt-1 text-accent-green/80">
            Total este año: {librosTotales + 1} {librosTotales + 1 === 1 ? 'libro' : 'libros'}
          </div>
        )}
      </button>
    </div>
  )
}

import { DayEntry } from '../../types'
import { bedtimeStatus, PRESETS_ACOSTARSE } from '../../lib/horaAcostarse'

interface Props {
  entry: Partial<DayEntry>
  onChange: (fields: Partial<DayEntry>) => void
}

const config = {
  verde: { text: 'text-accent-green', bg: 'bg-accent-green/15', border: 'border-accent-green/40', label: 'En hora' },
  ambar: { text: 'text-accent-amber', bg: 'bg-accent-amber/15', border: 'border-accent-amber/40', label: 'Un poco tarde' },
  rojo: { text: 'text-accent-red', bg: 'bg-accent-red/15', border: 'border-accent-red/40', label: 'Muy tarde' },
}

export function StepAcostarse({ entry, onChange }: Props) {
  const hora = entry.horaAcostarse ?? '23:00'
  const estado = bedtimeStatus(hora)
  const cfg = config[estado]

  return (
    <div className="flex flex-col items-center gap-8 py-6 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-1">¿A qué hora te acostaste ayer?</h2>
        <p className="text-zinc-500 text-sm">El dato central del día</p>
      </div>

      <input
        type="time"
        value={hora}
        onChange={e => onChange({ horaAcostarse: e.target.value })}
        className="bg-surface-2 border border-surface-3 rounded-2xl px-6 py-4 text-4xl font-bold text-white tabular-nums text-center focus:outline-none focus:border-accent-green/60"
      />

      <div className="flex gap-2 flex-wrap justify-center">
        {PRESETS_ACOSTARSE.map(p => (
          <button
            key={p}
            onClick={() => onChange({ horaAcostarse: p })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              hora === p ? 'bg-accent-green text-black' : 'bg-surface-2 text-zinc-400'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className={`w-full rounded-2xl p-5 border ${cfg.bg} ${cfg.border} text-center`}>
        <p className={`text-lg font-bold ${cfg.text}`}>{cfg.label}</p>
        <p className="text-zinc-500 text-xs mt-1">Verde ≤23:00 · Ámbar hasta 00:00 · Rojo después</p>
      </div>
    </div>
  )
}

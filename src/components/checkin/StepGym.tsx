import { Toggle } from '../ui/Toggle'
import { DayEntry } from '../../types'
import { AppState } from '../../types'
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns'
import { parseISO } from 'date-fns'

interface Props {
  entry: Partial<DayEntry>
  onChange: (fields: Partial<DayEntry>) => void
  date: string
  entries: AppState['entries']
}

export function StepGym({ entry, onChange, date, entries }: Props) {
  const entreno = entry.entreno ?? false
  const hoy = parseISO(date)
  const inicio = startOfWeek(hoy, { weekStartsOn: 1 })
  const fin = endOfWeek(hoy, { weekStartsOn: 1 })
  const diasSemana = eachDayOfInterval({ start: inicio, end: hoy })

  const sesionesEstasSemana = diasSemana.reduce((acc, d) => {
    const key = format(d, 'yyyy-MM-dd')
    if (key === date) return acc + (entreno ? 1 : 0)
    return acc + (entries[key]?.entreno ? 1 : 0)
  }, 0)

  return (
    <div className="flex flex-col items-center gap-8 py-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Gym</h2>
        <p className="text-zinc-500 text-sm">Objetivo: 3 sesiones/semana</p>
      </div>

      <Toggle
        label="Entrené hoy"
        value={entreno}
        onChange={v => onChange({ entreno: v })}
      />

      <div className="flex gap-2 mt-2">
        {[1, 2, 3].map(n => (
          <div
            key={n}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
              sesionesEstasSemana >= n
                ? 'bg-accent-green text-black font-bold'
                : 'bg-surface-2 text-zinc-600'
            }`}
          >
            {n}
          </div>
        ))}
      </div>
      <p className="text-zinc-500 text-sm -mt-4">
        {sesionesEstasSemana}/3 esta semana
      </p>
    </div>
  )
}

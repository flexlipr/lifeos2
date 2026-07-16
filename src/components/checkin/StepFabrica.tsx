import { Toggle } from '../ui/Toggle'
import { DayEntry, AppState } from '../../types'
import { startOfMonth, format } from 'date-fns'
import { parseISO } from 'date-fns'

interface Props {
  entry: Partial<DayEntry>
  onChange: (fields: Partial<DayEntry>) => void
  date: string
  entries: AppState['entries']
}

export function StepFabrica({ entry, onChange, date, entries }: Props) {
  const trabajoFabrica = entry.trabajoFabrica ?? false

  const hoy = parseISO(date)
  const inicioMes = startOfMonth(hoy)

  const diasTrabajadosMes = Object.values(entries).filter(e => {
    if (!e) return false
    const d = parseISO(e.date)
    return d >= inicioMes && d <= hoy && e.trabajoFabrica
  }).length + (trabajoFabrica ? 1 : 0)

  const diasTrabajadosVerano = Object.values(entries).filter(e => {
    if (!e) return false
    const d = parseISO(e.date)
    const inicio = new Date('2026-07-01')
    const fin = new Date('2026-08-31')
    return d >= inicio && d <= hoy && e.trabajoFabrica
  }).length + (trabajoFabrica ? 1 : 0)

  return (
    <div className="flex flex-col gap-5 py-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Fábrica</h2>
        <p className="text-zinc-500 text-sm">Solo si tocó hoy</p>
      </div>

      <Toggle
        label="Trabajé en la fábrica hoy"
        value={trabajoFabrica}
        onChange={v => onChange({ trabajoFabrica: v })}
      />

      <div className="bg-surface-2 rounded-2xl p-5 flex justify-around">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{diasTrabajadosMes}</div>
          <div className="text-xs text-zinc-500 mt-1">días este mes</div>
        </div>
        <div className="w-px bg-surface-3" />
        <div className="text-center">
          <div className="text-3xl font-bold text-accent-green">{diasTrabajadosVerano}</div>
          <div className="text-xs text-zinc-500 mt-1">días de verano</div>
        </div>
      </div>
    </div>
  )
}

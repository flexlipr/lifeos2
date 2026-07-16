import { Stepper } from '../ui/Stepper'
import { DayEntry } from '../../types'
import { parseISO, getDay } from 'date-fns'

interface Props {
  entry: Partial<DayEntry>
  onChange: (fields: Partial<DayEntry>) => void
  date: string
}

export function StepCigarros({ entry, onChange, date }: Props) {
  const cigarros = entry.cigarros ?? 0
  const diaSemana = getDay(parseISO(date))
  const esFinde = diaSemana === 0 || diaSemana === 6

  return (
    <div className="flex flex-col items-center gap-8 py-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Cigarros sueltos</h2>
        <p className="text-zinc-500 text-sm">
          {esFinde ? 'Fin de semana — sin restricción' : 'Objetivo: 0 entre semana'}
        </p>
      </div>

      <Stepper
        value={cigarros}
        onChange={v => onChange({ cigarros: v })}
        min={0}
      />

      {!esFinde && cigarros > 0 && (
        <p className="text-accent-amber text-sm text-center">
          Cigarros entre semana contarán como fallo en el semáforo
        </p>
      )}
    </div>
  )
}

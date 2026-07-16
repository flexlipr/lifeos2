import { Toggle } from '../ui/Toggle'
import { Stepper } from '../ui/Stepper'
import { DayEntry } from '../../types'
import { parseISO, getDay } from 'date-fns'

interface Props {
  entry: Partial<DayEntry>
  onChange: (fields: Partial<DayEntry>) => void
  date: string
}

export function StepAlcohol({ entry, onChange, date }: Props) {
  const fueAlBar = entry.fueAlBar ?? false
  const bebidasAlcohol = entry.bebidasAlcohol ?? 0
  const nocheDefiesta = entry.nocheDefiesta ?? false
  const copas = entry.copas ?? 0
  const diaSemana = getDay(parseISO(date))
  const esSabado = diaSemana === 6

  return (
    <div className="flex flex-col gap-5 py-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Alcohol</h2>
        <p className="text-zinc-500 text-sm">Solo si hubo movimiento</p>
      </div>

      <Toggle
        label="Fui al bar"
        value={fueAlBar}
        onChange={v => onChange({ fueAlBar: v, bebidasAlcohol: v ? bebidasAlcohol : 0 })}
      />

      {fueAlBar && (
        <div className="bg-surface-2 rounded-2xl p-5 flex flex-col items-center gap-3">
          <Stepper
            label="Bebidas con alcohol"
            value={bebidasAlcohol}
            onChange={v => onChange({ bebidasAlcohol: v })}
            min={0}
          />
          {bebidasAlcohol > 2 && (
            <p className="text-accent-red text-xs text-center">Máx 2 por visita</p>
          )}
        </div>
      )}

      {esSabado && (
        <Toggle
          label="Noche de fiesta"
          sublabel="Máx 2 fiestas al mes"
          value={nocheDefiesta}
          onChange={v => onChange({ nocheDefiesta: v, copas: v ? copas : 0 })}
        />
      )}

      {nocheDefiesta && (
        <div className="bg-surface-2 rounded-2xl p-5 flex flex-col items-center gap-3">
          <Stepper
            label="Copas en la fiesta"
            value={copas}
            onChange={v => onChange({ copas: v })}
            min={0}
          />
          {copas > 2 && (
            <p className="text-accent-red text-xs text-center">Máx 2 copas por fiesta</p>
          )}
        </div>
      )}

      {!fueAlBar && !esSabado && (
        <div className="flex items-center justify-center py-4">
          <p className="text-zinc-600 text-sm">Sin nada que registrar, continúa</p>
        </div>
      )}
    </div>
  )
}

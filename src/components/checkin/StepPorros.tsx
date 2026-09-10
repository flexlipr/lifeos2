import { useState } from 'react'
import { Toggle } from '../ui/Toggle'
import { Stepper } from '../ui/Stepper'
import { DayEntry } from '../../types'
import { esDiaPermitidoPorros } from '../../lib/porros'
import { parseISO } from 'date-fns'

interface Props {
  entry: Partial<DayEntry>
  onChange: (fields: Partial<DayEntry>) => void
  date: string
}

export function StepPorros({ entry, onChange, date }: Props) {
  const porros = entry.porros ?? 0
  const permitido = esDiaPermitidoPorros(parseISO(date))
  const [fumeHoy, setFumeHoy] = useState(porros > 0)

  function handleToggle(v: boolean) {
    setFumeHoy(v)
    onChange({ porros: v ? Math.max(1, porros) : 0 })
  }

  return (
    <div className="flex flex-col items-center gap-8 py-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Porros</h2>
        <p className="text-zinc-500 text-sm">
          {permitido ? 'Hoy toca — viernes/sábado' : 'Entre semana la regla es no fumar'}
        </p>
      </div>

      {permitido ? (
        <Stepper value={porros} onChange={v => onChange({ porros: v })} min={0} />
      ) : (
        <>
          <Toggle label="¿Fumé hoy?" value={fumeHoy} onChange={handleToggle} />
          {fumeHoy && (
            <Stepper value={porros} onChange={v => onChange({ porros: v })} min={0} />
          )}
          {fumeHoy && (
            <p className="text-accent-amber text-sm text-center">
              Fuera de la regla (solo vie/sáb) — queda registrado
            </p>
          )}
        </>
      )}
    </div>
  )
}

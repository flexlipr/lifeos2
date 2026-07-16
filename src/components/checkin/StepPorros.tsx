import { useState } from 'react'
import { Stepper } from '../ui/Stepper'
import { DayEntry } from '../../types'
import { getFaseForDate, describeFaseRegla, evaluarPorros } from '../../lib/fases'
import { parseISO, getDay } from 'date-fns'

interface Props {
  entry: Partial<DayEntry>
  onChange: (fields: Partial<DayEntry>) => void
  date: string
}

export function StepPorros({ entry, onChange, date }: Props) {
  const [razon, setRazon] = useState(entry.porrosEscalonRazon ?? '')
  const porros = entry.porros ?? 0
  const fase = getFaseForDate(parseISO(date))
  const diaSemana = getDay(parseISO(date))
  const esDiaPermitido = fase?.regla.tipo === 'diasPermitidos'
    ? (fase.regla as { tipo: 'diasPermitidos'; dias: number[] }).dias.includes(diaSemana)
    : true

  const estado = evaluarPorros(parseISO(date), porros)
  const needsEscalon3 = esDiaPermitido === false && porros > 0 && fase?.regla.tipo === 'diasPermitidos'

  function handleRazon(r: string) {
    setRazon(r)
    onChange({ porrosEscalonRazon: r })
  }

  function handleJustificado(j: boolean) {
    onChange({ porrosEscalonJustificado: j, porrosEscalonRazon: razon })
  }

  return (
    <div className="flex flex-col items-center gap-8 py-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Porros hoy</h2>
        {fase ? (
          <div className="inline-flex items-center gap-2 bg-surface-2 px-4 py-2 rounded-full">
            <span className="text-zinc-400 text-sm">{fase.nombre}:</span>
            <span className="text-accent-amber font-semibold text-sm">{describeFaseRegla(fase.regla)}</span>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">Sin fase activa (antes del 9 jul)</p>
        )}
      </div>

      <Stepper
        value={porros}
        onChange={v => onChange({ porros: v })}
        min={0}
      />

      {needsEscalon3 && (
        <div className="w-full bg-accent-amber/10 border border-accent-amber/30 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-accent-amber text-sm font-medium text-center">
            Escalón 3: hoy no toca. ¿Qué pasó?
          </p>
          <input
            className="w-full bg-surface-2 border border-surface-3 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-accent-amber/60"
            placeholder="Razón (ej: cumpleaños de Marta)"
            value={razon}
            onChange={e => handleRazon(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleJustificado(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                entry.porrosEscalonJustificado === true
                  ? 'bg-accent-amber text-black'
                  : 'bg-surface-2 text-zinc-300'
              }`}
            >
              Justificado (ámbar)
            </button>
            <button
              onClick={() => handleJustificado(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                entry.porrosEscalonJustificado === false
                  ? 'bg-accent-red text-white'
                  : 'bg-surface-2 text-zinc-300'
              }`}
            >
              La lié (rojo)
            </button>
          </div>
        </div>
      )}

      {estado === 'rojo' && fase?.regla.tipo === 'tope' && (
        <p className="text-accent-red text-sm text-center">
          Pasaste el límite de la fase
        </p>
      )}
    </div>
  )
}

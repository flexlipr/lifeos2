import { useState } from 'react'
import { ProgressBar } from '../ui/ProgressBar'
import { StepPorros } from './StepPorros'
import { StepCigarros } from './StepCigarros'
import { StepAlcohol } from './StepAlcohol'
import { StepGym } from './StepGym'
import { StepLectura } from './StepLectura'
import { StepFabrica } from './StepFabrica'
import { DayEntry, AppState } from '../../types'

interface Props {
  date: string
  initial?: DayEntry
  state: AppState
  onComplete: (entry: DayEntry) => void
}

const TOTAL_STEPS = 6

function emptyEntry(date: string): Partial<DayEntry> {
  return {
    date,
    porros: 0,
    cigarros: 0,
    fueAlBar: false,
    bebidasAlcohol: 0,
    nocheDefiesta: false,
    copas: 0,
    entreno: false,
    leyo: false,
    terminalLibro: false,
    trabajoFabrica: false,
  }
}

export function CheckinFlow({ date, initial, state, onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [entry, setEntry] = useState<Partial<DayEntry>>(initial ?? emptyEntry(date))

  function update(fields: Partial<DayEntry>) {
    setEntry(prev => ({ ...prev, ...fields }))
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1)
    } else {
      const complete: DayEntry = {
        date,
        completedAt: new Date().toISOString(),
        porros: entry.porros ?? 0,
        porrosEscalonRazon: entry.porrosEscalonRazon,
        porrosEscalonJustificado: entry.porrosEscalonJustificado,
        cigarros: entry.cigarros ?? 0,
        fueAlBar: entry.fueAlBar ?? false,
        bebidasAlcohol: entry.bebidasAlcohol ?? 0,
        nocheDefiesta: entry.nocheDefiesta ?? false,
        copas: entry.copas ?? 0,
        entreno: entry.entreno ?? false,
        leyo: entry.leyo ?? false,
        terminalLibro: entry.terminalLibro ?? false,
        trabajoFabrica: entry.trabajoFabrica ?? false,
      }
      onComplete(complete)
    }
  }

  function handleBack() {
    if (step > 1) setStep(s => s - 1)
  }

  const stepTitles = ['Porros', 'Cigarros', 'Alcohol', 'Gym', 'Lectura', 'Fábrica']

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      {/* Header */}
      <div className="pt-safe-top pb-4">
        <div className="flex items-center justify-between px-4 mb-4 pt-4">
          <button
            onClick={handleBack}
            className={`text-zinc-500 text-sm px-2 py-1 ${step === 1 ? 'invisible' : ''}`}
          >
            ← Atrás
          </button>
          <span className="text-zinc-400 text-sm font-medium">
            {stepTitles[step - 1]}
          </span>
          <span className="text-zinc-600 text-sm">{step}/{TOTAL_STEPS}</span>
        </div>
        <ProgressBar steps={TOTAL_STEPS} current={step} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {step === 1 && <StepPorros entry={entry} onChange={update} date={date} />}
        {step === 2 && <StepCigarros entry={entry} onChange={update} date={date} />}
        {step === 3 && <StepAlcohol entry={entry} onChange={update} date={date} />}
        {step === 4 && <StepGym entry={entry} onChange={update} date={date} entries={state.entries} />}
        {step === 5 && <StepLectura entry={entry} onChange={update} librosTotales={state.librosTotales} />}
        {step === 6 && <StepFabrica entry={entry} onChange={update} date={date} entries={state.entries} />}
      </div>

      {/* Next button */}
      <div className="p-4 pb-safe-bottom">
        <button
          onClick={handleNext}
          className="w-full py-5 rounded-2xl bg-accent-green text-black font-bold text-lg active:opacity-80 transition-opacity"
        >
          {step < TOTAL_STEPS ? 'Siguiente →' : 'Completar check-in ✓'}
        </button>
      </div>
    </div>
  )
}

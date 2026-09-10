import { Toggle } from '../ui/Toggle'
import { DayEntry } from '../../types'

interface Props {
  entry: Partial<DayEntry>
  onChange: (fields: Partial<DayEntry>) => void
}

export function StepJournaling({ entry, onChange }: Props) {
  const journaling = entry.journaling ?? false

  return (
    <div className="flex flex-col gap-5 py-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Journaling</h2>
        <p className="text-zinc-500 text-sm">Solo si escribiste hoy en papel</p>
      </div>

      <Toggle
        label="Hice journaling hoy"
        value={journaling}
        onChange={v => onChange({ journaling: v })}
      />
    </div>
  )
}

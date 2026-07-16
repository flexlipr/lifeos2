interface StepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  label?: string
}

export function Stepper({ value, onChange, min = 0, max = 20, label }: StepperProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {label && <span className="text-sm text-zinc-400">{label}</span>}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-16 h-16 rounded-full bg-surface-2 text-3xl font-light text-zinc-300 active:bg-surface-3 flex items-center justify-center select-none"
        >
          −
        </button>
        <span className="text-5xl font-bold text-white w-12 text-center tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-16 h-16 rounded-full bg-surface-2 text-3xl font-light text-zinc-300 active:bg-surface-3 flex items-center justify-center select-none"
        >
          +
        </button>
      </div>
    </div>
  )
}

interface ProgressBarProps {
  steps: number
  current: number
}

export function ProgressBar({ steps, current }: ProgressBarProps) {
  return (
    <div className="flex gap-1.5 px-4">
      {Array.from({ length: steps }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i < current ? 'bg-accent-green' : 'bg-surface-3'
          }`}
        />
      ))}
    </div>
  )
}

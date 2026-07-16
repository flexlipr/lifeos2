interface ToggleProps {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  sublabel?: string
}

export function Toggle({ label, value, onChange, sublabel }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-colors ${
        value ? 'bg-accent-green/20 border border-accent-green/40' : 'bg-surface-2 border border-transparent'
      }`}
    >
      <div className="text-left">
        <span className="text-lg font-medium text-white">{label}</span>
        {sublabel && <p className="text-sm text-zinc-400 mt-0.5">{sublabel}</p>}
      </div>
      <div
        className={`relative w-14 h-7 rounded-full transition-colors ${value ? 'bg-accent-green' : 'bg-zinc-700'}`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  )
}

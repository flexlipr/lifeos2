import { DayEntry, AppState } from '../../types'
import { calcularSemaforo } from '../../lib/semaforo'
import { rachaCheckin, rachaNochesVerdes, rachaSinCigarros, rachaLectura } from '../../lib/rachas'
import { calcularComparativa } from '../../lib/comparativa'
import { formatMinutosNormalizados } from '../../lib/horaAcostarse'
import { parseISO } from 'date-fns'

interface Props {
  entry: DayEntry
  state: AppState
  onContinue: () => void
  isEditing?: boolean
}

const semaforoConfig = {
  verde: { bg: 'bg-accent-green', text: 'text-black', emoji: '🟢', label: 'Día verde' },
  ambar: { bg: 'bg-accent-amber', text: 'text-black', emoji: '🟡', label: 'Día ámbar' },
  rojo:  { bg: 'bg-accent-red',   text: 'text-white',  emoji: '🔴', label: 'Día rojo' },
}

function DeltaArrow({ actual, anterior, invertido = false }: { actual: number; anterior: number; invertido?: boolean }) {
  if (actual === anterior) return <span className="text-zinc-500">—</span>
  const mejor = invertido ? actual < anterior : actual > anterior
  return (
    <span className={mejor ? 'text-accent-green' : 'text-accent-red'}>
      {actual > anterior ? `↑${actual - anterior}` : `↓${anterior - actual}`}
    </span>
  )
}

export function ResultScreen({ entry, state, onContinue, isEditing }: Props) {
  const semaforo = calcularSemaforo(entry)
  const cfg = semaforoConfig[semaforo.color]
  const hoy = parseISO(entry.date)

  const rachaCI = rachaCheckin(state.entries, hoy)
  const rachaNV = rachaNochesVerdes(state.entries, hoy)
  const rachaSC = rachaSinCigarros(state.entries, hoy)
  const rachaL = rachaLectura(state.entries, hoy)
  const comp = calcularComparativa(state.entries, hoy)

  return (
    <div className="flex flex-col min-h-screen bg-surface-0 px-4 py-6 gap-6 overflow-y-auto">
      {/* Semáforo */}
      <div className={`${cfg.bg} rounded-3xl p-6 flex flex-col items-center gap-2`}>
        <span className="text-5xl">{cfg.emoji}</span>
        <h2 className={`text-2xl font-bold ${cfg.text}`}>{cfg.label}</h2>
        {semaforo.fallos.length > 0 && (
          <ul className={`text-sm ${cfg.text} opacity-80 text-center list-none`}>
            {semaforo.fallos.map((f, i) => <li key={i}>· {f}</li>)}
          </ul>
        )}
        {semaforo.fallos.length === 0 && (
          <p className={`text-sm ${cfg.text} opacity-80`}>Todo dentro de las reglas</p>
        )}
      </div>

      {/* Rachas */}
      <div className="bg-surface-1 rounded-2xl p-5">
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Rachas</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{rachaCI}</div>
            <div className="text-xs text-zinc-500 mt-1">check-in</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-green">{rachaNV}</div>
            <div className="text-xs text-zinc-500 mt-1">noches verdes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-amber">{rachaSC}</div>
            <div className="text-xs text-zinc-500 mt-1">sin cigarros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-blue">{rachaL}</div>
            <div className="text-xs text-zinc-500 mt-1">leyendo</div>
          </div>
        </div>
      </div>

      {/* Comparativa semanal */}
      <div className="bg-surface-1 rounded-2xl p-5">
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Esta semana vs anterior</h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Hora media de acostarse</span>
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold">
                {comp.acostarseMedia.actual !== null ? formatMinutosNormalizados(comp.acostarseMedia.actual) : '—'}
              </span>
              <span className="text-zinc-600 text-sm">
                {comp.acostarseMedia.anterior !== null ? formatMinutosNormalizados(comp.acostarseMedia.anterior) : '—'}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Gym</span>
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold">{comp.gym.actual}/3</span>
              <DeltaArrow actual={comp.gym.actual} anterior={comp.gym.anterior} />
              <span className="text-zinc-600 text-sm">{comp.gym.anterior}/3</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Cigarros sueltos</span>
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold">{comp.cigarros.actual}</span>
              <DeltaArrow actual={comp.cigarros.actual} anterior={comp.cigarros.anterior} invertido />
              <span className="text-zinc-600 text-sm">{comp.cigarros.anterior}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Días leyendo</span>
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold">{comp.lectura.actual}</span>
              <DeltaArrow actual={comp.lectura.actual} anterior={comp.lectura.anterior} />
              <span className="text-zinc-600 text-sm">{comp.lectura.anterior}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-5 rounded-2xl bg-surface-2 text-white font-semibold text-lg active:bg-surface-3"
      >
        {isEditing ? 'Guardar cambios' : 'Ver dashboard →'}
      </button>
    </div>
  )
}

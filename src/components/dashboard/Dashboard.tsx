import { AppState, DayEntry } from '../../types'
import { calcularSemaforo } from '../../lib/semaforo'
import { rachaCheckin, rachaNochesVerdes, rachaSinCigarros, rachaLectura, diasSeguidosIncumpliendo, REGLAS } from '../../lib/rachas'
import { calcularComparativa } from '../../lib/comparativa'
import { formatMinutosNormalizados } from '../../lib/horaAcostarse'
import { ultimoPesaje, diferenciaConAnterior } from '../../lib/peso'
import { PesoChart } from '../peso/PesoChart'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  state: AppState
  todayStr: string
  todayEntry: DayEntry
  yesterdayStr: string
  canEditYesterday: boolean
  onEditYesterday: () => void
  onSettings: () => void
  onOpenPeso: () => void
}

const semaforoConfig = {
  verde: { dot: 'bg-accent-green', label: 'Día verde', text: 'text-accent-green' },
  ambar: { dot: 'bg-accent-amber', label: 'Día ámbar', text: 'text-accent-amber' },
  rojo:  { dot: 'bg-accent-red',   label: 'Día rojo',  text: 'text-accent-red' },
}

function DeltaArrow({ actual, anterior, invertido = false }: { actual: number; anterior: number; invertido?: boolean }) {
  if (actual === anterior) return <span className="text-zinc-600 text-xs">—</span>
  const mejor = invertido ? actual < anterior : actual > anterior
  return (
    <span className={`text-xs ${mejor ? 'text-accent-green' : 'text-accent-red'}`}>
      {actual > anterior ? `↑${actual - anterior}` : `↓${anterior - actual}`}
    </span>
  )
}

export function Dashboard({ state, todayStr, todayEntry, yesterdayStr, canEditYesterday, onEditYesterday, onSettings, onOpenPeso }: Props) {
  const hoy = parseISO(todayStr)
  const semaforo = calcularSemaforo(todayEntry)
  const cfg = semaforoConfig[semaforo.color]

  const rachaCI = rachaCheckin(state.entries, hoy)
  const rachaNV = rachaNochesVerdes(state.entries, hoy)
  const rachaSC = rachaSinCigarros(state.entries, hoy)
  const rachaL = rachaLectura(state.entries, hoy)

  const comp = calcularComparativa(state.entries, hoy)

  const alertas = REGLAS
    .map(r => ({ ...r, dias: diasSeguidosIncumpliendo(state.entries, hoy, r.id) }))
    .filter(r => r.dias >= 2)

  const ultimo = ultimoPesaje(state.pesajes)
  const diferenciaPeso = diferenciaConAnterior(state.pesajes)

  const fechaDisplay = format(hoy, "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      {/* Header */}
      <div className="px-4 pt-safe-top pt-6 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-white">LifeOS</h1>
          <p className="text-zinc-500 text-sm">{fechaDisplay}</p>
        </div>
        <button
          onClick={onSettings}
          className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-zinc-400"
        >
          ⚙
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-safe-bottom pb-6 flex flex-col gap-4">

        {/* Alertas: 2 días seguidos incumpliendo la misma regla */}
        {alertas.map(a => (
          <div key={a.id} className="bg-accent-red/15 border border-accent-red/30 rounded-2xl p-4">
            <p className="text-accent-red text-sm font-medium">
              ⚠ {a.dias} días seguidos {a.label}
            </p>
          </div>
        ))}

        {/* Semáforo */}
        <div className="bg-surface-1 rounded-2xl p-5 flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${cfg.dot} flex-shrink-0`} />
          <div className="flex-1">
            <div className={`font-semibold ${cfg.text}`}>{cfg.label}</div>
            {semaforo.fallos.length > 0 ? (
              <p className="text-zinc-500 text-xs mt-0.5">{semaforo.fallos[0]}{semaforo.fallos.length > 1 ? ` +${semaforo.fallos.length - 1}` : ''}</p>
            ) : (
              <p className="text-zinc-500 text-xs mt-0.5">Todo en regla</p>
            )}
          </div>
        </div>

        {/* Rachas */}
        <div className="bg-surface-1 rounded-2xl p-5">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Rachas</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{rachaCI}</div>
              <div className="text-xs text-zinc-500 mt-0.5">check-in</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-green">{rachaNV}</div>
              <div className="text-xs text-zinc-500 mt-0.5">noches verdes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-amber">{rachaSC}</div>
              <div className="text-xs text-zinc-500 mt-0.5">sin cigarros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-blue">{rachaL}</div>
              <div className="text-xs text-zinc-500 mt-0.5">leyendo</div>
            </div>
          </div>
        </div>

        {/* Comparativa semanal */}
        <div className="bg-surface-1 rounded-2xl p-5">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Esta semana vs anterior</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Hora media acostarse</span>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">
                  {comp.acostarseMedia.actual !== null ? formatMinutosNormalizados(comp.acostarseMedia.actual) : '—'}
                </span>
                <span className="text-zinc-600 text-sm">
                  {comp.acostarseMedia.anterior !== null ? formatMinutosNormalizados(comp.acostarseMedia.anterior) : '—'}
                </span>
              </div>
            </div>
            {[
              { label: 'Gym', a: comp.gym.actual, b: comp.gym.anterior, suffix: '/3' },
              { label: 'Cigarros', a: comp.cigarros.actual, b: comp.cigarros.anterior, inv: true },
              { label: 'Lectura', a: comp.lectura.actual, b: comp.lectura.anterior },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{row.a}{row.suffix ?? ''}</span>
                  <DeltaArrow actual={row.a} anterior={row.b} invertido={row.inv} />
                  <span className="text-zinc-600 text-sm">{row.b}{row.suffix ?? ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peso */}
        <button onClick={onOpenPeso} className="bg-surface-1 rounded-2xl p-5 text-left active:bg-surface-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Peso</h3>
            <span className="text-zinc-600 text-xs">Ver más →</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="text-2xl font-bold text-white">{ultimo ? `${ultimo.kg} kg` : '—'}</div>
            {diferenciaPeso !== null && (
              <span className={`text-sm font-medium ${diferenciaPeso < 0 ? 'text-accent-green' : diferenciaPeso > 0 ? 'text-accent-red' : 'text-zinc-400'}`}>
                {diferenciaPeso > 0 ? '+' : ''}{diferenciaPeso} kg
              </span>
            )}
          </div>
          <PesoChart pesajes={state.pesajes} />
        </button>

        {/* Libros */}
        <div className="bg-surface-1 rounded-2xl p-5 flex flex-col items-center gap-1">
          <div className="text-3xl font-bold text-accent-blue">{state.librosTotales}</div>
          <div className="text-xs text-zinc-500 text-center">libros terminados este año</div>
        </div>

        {/* Editar ayer */}
        {canEditYesterday && (
          <button
            onClick={onEditYesterday}
            className="w-full py-4 rounded-2xl bg-surface-2 border border-surface-3 text-zinc-400 text-sm font-medium active:bg-surface-3"
          >
            Editar check-in de ayer
          </button>
        )}
      </div>
    </div>
  )
}

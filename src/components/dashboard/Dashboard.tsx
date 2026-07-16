import { AppState, DayEntry } from '../../types'
import { calcularSemaforo } from '../../lib/semaforo'
import { rachaCheckin, rachaPorrosDentroFase, rachaLectura, diasSeguidos2Tope } from '../../lib/rachas'
import { calcularComparativa } from '../../lib/comparativa'
import { getFaseActual, describeFaseRegla, diasParaSiguienteFase } from '../../lib/fases'
import { hitosProximos, HITOS } from '../../lib/hitos'
import { format, parseISO, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  state: AppState
  todayStr: string
  todayEntry: DayEntry
  yesterdayStr: string
  canEditYesterday: boolean
  onEditYesterday: () => void
  onSettings: () => void
  onToggleHito: (id: string) => void
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

export function Dashboard({ state, todayStr, todayEntry, yesterdayStr, canEditYesterday, onEditYesterday, onSettings, onToggleHito }: Props) {
  const hoy = parseISO(todayStr)
  const semaforo = calcularSemaforo(todayEntry)
  const cfg = semaforoConfig[semaforo.color]

  const rachaCI = rachaCheckin(state.entries, hoy)
  const rachaP = rachaPorrosDentroFase(state.entries, hoy)
  const rachaL = rachaLectura(state.entries, hoy)
  const diasTope = diasSeguidos2Tope(state.entries, hoy)

  const comp = calcularComparativa(state.entries, hoy)
  const fase = getFaseActual()
  const diasFase = diasParaSiguienteFase(hoy)

  const inicioVerano = new Date('2026-07-01')
  const finVerano = new Date('2026-08-31')
  const diasFabricaVerano = Object.values(state.entries).filter(e => {
    if (!e) return false
    const d = parseISO(e.date)
    return d >= inicioVerano && d <= finVerano && e.trabajoFabrica
  }).length

  const hitos = hitosProximos(hoy, state.hitosCompletados)

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

        {/* Alerta 2 días tope */}
        {diasTope >= 2 && (
          <div className="bg-accent-red/15 border border-accent-red/30 rounded-2xl p-4">
            <p className="text-accent-red text-sm font-medium">
              ⚠ 2 días seguidos por encima del tope — revisa el plan
            </p>
          </div>
        )}

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
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{rachaCI}</div>
              <div className="text-xs text-zinc-500 mt-0.5">check-in</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-amber">{rachaP}</div>
              <div className="text-xs text-zinc-500 mt-0.5">en fase</div>
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
            {[
              { label: 'Porros', a: comp.porros.actual, b: comp.porros.anterior, inv: true },
              { label: 'Gym', a: comp.gym.actual, b: comp.gym.anterior, suffix: '/3' },
              { label: 'Bar', a: comp.bar.actual, b: comp.bar.anterior, inv: true },
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
            <div className="flex justify-between items-center pt-2 border-t border-surface-3">
              <span className="text-zinc-400 text-sm">Fiestas/mes</span>
              <span className={`text-sm font-medium ${comp.fiestasMes > 2 ? 'text-accent-red' : 'text-white'}`}>
                {comp.fiestasMes}/2
              </span>
            </div>
          </div>
        </div>

        {/* Fase de porros */}
        {fase && (
          <div className="bg-surface-1 rounded-2xl p-5">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Fase porros</h3>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-semibold">{fase.nombre}</div>
                <div className="text-accent-amber text-sm mt-0.5">{describeFaseRegla(fase.regla)}</div>
              </div>
              {diasFase !== null && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-zinc-300">{diasFase}</div>
                  <div className="text-xs text-zinc-500">días para siguiente</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fábrica verano + Libros */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-1 rounded-2xl p-5 flex flex-col items-center gap-1">
            <div className="text-3xl font-bold text-accent-green">{diasFabricaVerano}</div>
            <div className="text-xs text-zinc-500 text-center">días fábrica<br/>verano</div>
          </div>
          <div className="bg-surface-1 rounded-2xl p-5 flex flex-col items-center gap-1">
            <div className="text-3xl font-bold text-accent-blue">{state.librosTotales}</div>
            <div className="text-xs text-zinc-500 text-center">libros<br/>este año</div>
          </div>
        </div>

        {/* Hitos próximos */}
        {hitos.length > 0 && (
          <div className="bg-surface-1 rounded-2xl p-5">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Hitos próximos</h3>
            <div className="flex flex-col gap-3">
              {hitos.map(h => (
                <button
                  key={h.id}
                  onClick={() => !h.esCalculado && onToggleHito(h.id)}
                  className="flex items-start gap-3 text-left"
                >
                  <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center ${
                    h.esCalculado ? 'border-surface-3 bg-surface-2' : 'border-zinc-600'
                  }`}>
                    {state.hitosCompletados.includes(h.id) && (
                      <span className="text-accent-green text-xs">✓</span>
                    )}
                  </div>
                  <div>
                    <p className="text-zinc-300 text-sm">{h.texto}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">
                      Límite: {format(new Date(h.fechaLimite), "d MMM", { locale: es })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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

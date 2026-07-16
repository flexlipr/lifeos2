import { useRef } from 'react'
import { AppState } from '../types'
import { exportJSON, importJSON } from '../lib/store'
import { requestNotificationPermission } from '../lib/notifications'

interface Props {
  state: AppState
  onImport: (state: AppState) => void
  onBack: () => void
}

export function Settings({ state, onImport, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importJSON(file)
      onImport(imported)
      alert('Datos importados correctamente')
    } catch (err) {
      alert('Error al importar: ' + (err as Error).message)
    }
    e.target.value = ''
  }

  async function handleNotif() {
    const granted = await requestNotificationPermission()
    alert(granted ? 'Notificaciones activadas ✓' : 'Permiso denegado. Actívalo en los ajustes del navegador.')
  }

  const totalEntries = Object.keys(state.entries).length
  const firstEntry = Object.keys(state.entries).sort()[0] ?? '—'

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <div className="px-4 pt-safe-top pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 text-xl px-1">←</button>
        <h1 className="text-xl font-bold text-white">Ajustes</h1>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-4 overflow-y-auto pb-safe-bottom pb-6">

        <div className="bg-surface-1 rounded-2xl overflow-hidden">
          <button
            onClick={() => exportJSON(state)}
            className="w-full flex items-center justify-between px-5 py-4 active:bg-surface-2"
          >
            <div className="text-left">
              <div className="text-white font-medium">Exportar datos</div>
              <div className="text-zinc-500 text-sm">{totalEntries} días registrados</div>
            </div>
            <span className="text-zinc-500 text-xl">↓</span>
          </button>
          <div className="h-px bg-surface-3 mx-5" />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-between px-5 py-4 active:bg-surface-2"
          >
            <div className="text-left">
              <div className="text-white font-medium">Importar datos</div>
              <div className="text-zinc-500 text-sm">Restaurar desde JSON</div>
            </div>
            <span className="text-zinc-500 text-xl">↑</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        <div className="bg-surface-1 rounded-2xl overflow-hidden">
          <button
            onClick={handleNotif}
            className="w-full flex items-center justify-between px-5 py-4 active:bg-surface-2"
          >
            <div className="text-left">
              <div className="text-white font-medium">Activar recordatorios</div>
              <div className="text-zinc-500 text-sm">22:00 · 22:30 · 23:00 · 23:30</div>
            </div>
            <span className="text-zinc-500 text-xl">🔔</span>
          </button>
        </div>

        <div className="bg-surface-1 rounded-2xl px-5 py-4">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Info</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Primer registro</span>
              <span className="text-zinc-300 text-sm">{firstEntry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Días registrados</span>
              <span className="text-zinc-300 text-sm">{totalEntries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Libros terminados</span>
              <span className="text-zinc-300 text-sm">{state.librosTotales}</span>
            </div>
          </div>
        </div>

        <p className="text-zinc-700 text-xs text-center px-4">
          Los datos se guardan en este dispositivo. Exporta regularmente para hacer backup.
        </p>
      </div>
    </div>
  )
}

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

function descargarBackupCrudo() {
  const raw = localStorage.getItem('lifeos2')
  if (!raw) return
  const blob = new Blob([raw], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lifeos-backup-emergencia-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col min-h-screen bg-surface-0 px-4 py-8 gap-6 items-center justify-center text-center">
          <div className="text-5xl">⚠️</div>
          <div>
            <h1 className="text-xl font-bold text-white mb-2">Algo ha fallado</h1>
            <p className="text-zinc-500 text-sm">
              Tus datos siguen guardados en el dispositivo. Descarga un backup por si acaso y recarga la app.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={descargarBackupCrudo}
              className="w-full py-4 rounded-2xl bg-surface-2 text-white font-semibold active:bg-surface-3"
            >
              Descargar backup
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 rounded-2xl bg-accent-green text-black font-bold active:opacity-80"
            >
              Recargar app
            </button>
          </div>
          <p className="text-zinc-700 text-xs px-4">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

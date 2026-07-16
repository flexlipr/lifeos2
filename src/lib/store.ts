import { AppState, DayEntry } from '../types'

const KEY = 'lifeos2'

const DEFAULT_STATE: AppState = {
  entries: {},
  librosTotales: 0,
  hitosCompletados: [],
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function upsertEntry(state: AppState, entry: DayEntry): AppState {
  const prev = state.entries[entry.date]
  let librosTotales = state.librosTotales

  if (entry.terminalLibro && !prev?.terminalLibro) {
    librosTotales += 1
  }
  if (!entry.terminalLibro && prev?.terminalLibro) {
    librosTotales = Math.max(0, librosTotales - 1)
  }

  const next: AppState = {
    ...state,
    librosTotales,
    entries: { ...state.entries, [entry.date]: entry },
  }
  saveState(next)
  return next
}

export function toggleHito(state: AppState, id: string): AppState {
  const completados = state.hitosCompletados.includes(id)
    ? state.hitosCompletados.filter(h => h !== id)
    : [...state.hitosCompletados, id]
  const next = { ...state, hitosCompletados: completados }
  saveState(next)
  return next
}

export function exportJSON(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lifeos2-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target!.result as string) as AppState
        saveState(data)
        resolve(data)
      } catch {
        reject(new Error('Archivo JSON inválido'))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsText(file)
  })
}

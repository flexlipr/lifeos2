export interface DayEntry {
  date: string
  completedAt: string

  porros: number
  porrosEscalonRazon?: string
  porrosEscalonJustificado?: boolean

  cigarros: number

  fueAlBar: boolean
  bebidasAlcohol: number
  nocheDefiesta: boolean
  copas: number

  entreno: boolean

  leyo: boolean
  terminalLibro: boolean

  trabajoFabrica: boolean
}

export interface AppState {
  entries: Record<string, DayEntry>
  librosTotales: number
  hitosCompletados: string[]
}

export type FaseRegla =
  | { tipo: 'tope'; max: number }
  | { tipo: 'diasPermitidos'; dias: number[] }
  | { tipo: 'ocasional' }

export interface Fase {
  nombre: string
  inicio: string
  fin: string | null
  regla: FaseRegla
}

export interface Hito {
  id: string
  texto: string
  fechaLimite: string
  esCalculado?: boolean
}

export type SemaforoColor = 'verde' | 'ambar' | 'rojo'

export interface SemaforoResult {
  color: SemaforoColor
  fallos: string[]
}

export interface ComparativaSemana {
  porros: { actual: number; anterior: number }
  gym: { actual: number; anterior: number }
  bar: { actual: number; anterior: number }
  lectura: { actual: number; anterior: number }
  fiestasMes: number
}

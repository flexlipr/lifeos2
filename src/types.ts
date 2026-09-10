export interface DayEntry {
  date: string
  completedAt: string

  horaAcostarse: string // 'HH:mm', hora a la que se acostó la noche anterior

  cigarros: number

  entreno: boolean

  leyo: boolean
  terminalLibro: boolean

  porros: number

  journaling: boolean
}

export interface Pesaje {
  date: string
  kg: number
  fueraDeDia?: boolean
  motivo?: string
}

export interface RevisionSemanal {
  semanaInicio: string // lunes de la semana, 'yyyy-MM-dd'
  respuesta: string
  guardadaEn: string
}

export interface AppState {
  entries: Record<string, DayEntry>
  librosTotales: number
  pesajes: Pesaje[]
  revisionesSemanales: RevisionSemanal[]
}

export type SemaforoColor = 'verde' | 'ambar' | 'rojo'

export interface SemaforoResult {
  color: SemaforoColor
  fallos: string[]
}

export interface ComparativaSemana {
  acostarseMedia: { actual: number | null; anterior: number | null } // minutos desde medianoche, normalizado
  gym: { actual: number; anterior: number }
  cigarros: { actual: number; anterior: number }
  lectura: { actual: number; anterior: number }
}

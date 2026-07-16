import { Hito } from '../types'

export const HITOS: Hito[] = [
  {
    id: 'erasmus-investigacion',
    texto: '1h de investigación Erasmus: convenios del centro + lista de 3 países candidatos',
    fechaLimite: '2026-07-19',
  },
  {
    id: 'erasmus-contacto',
    texto: 'Contactar al coordinador de Erasmus/FCT',
    fechaLimite: '2026-09-07',
  },
  {
    id: 'ahorro-verano',
    texto: '800€ ahorrados antes del 31 de agosto',
    fechaLimite: '2026-08-31',
    esCalculado: true,
  },
]

export function hitosProximos(hoy: Date, completados: string[]): Hito[] {
  const limite = new Date(hoy)
  limite.setDate(limite.getDate() + 7)
  return HITOS.filter(h => {
    if (completados.includes(h.id)) return false
    const fecha = new Date(h.fechaLimite)
    return fecha <= limite
  })
}

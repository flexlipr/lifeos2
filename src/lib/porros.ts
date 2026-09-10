import { getDay } from 'date-fns'

// Regla fija (destino alcanzado): solo se fuma viernes y sábado.
export function esDiaPermitidoPorros(date: Date): boolean {
  const dia = getDay(date) // 0=dom, 1=lun, ..., 5=vie, 6=sab
  return dia === 5 || dia === 6
}

export function porrosFueraDeRegla(date: Date, porros: number): boolean {
  return !esDiaPermitidoPorros(date) && porros > 0
}

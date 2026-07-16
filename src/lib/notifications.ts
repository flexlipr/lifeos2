const REMINDER_TIMES = [
  { hour: 22, min: 0 },
  { hour: 22, min: 30 },
  { hour: 23, min: 0 },
  { hour: 23, min: 30 },
]

const SCHEDULED_KEY = 'lifeos2-notif-scheduled'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function getMsUntil(hour: number, min: number): number {
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour, min, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

// IDs de los timeouts activos (almacenados en memoria)
const timers: number[] = []

export function scheduleReminders(todayStr: string): void {
  cancelReminders()
  if (Notification.permission !== 'granted') return

  const alreadyScheduled = localStorage.getItem(SCHEDULED_KEY)
  if (alreadyScheduled === todayStr) return

  localStorage.setItem(SCHEDULED_KEY, todayStr)

  for (const { hour, min } of REMINDER_TIMES) {
    const ms = getMsUntil(hour, min)
    const id = window.setTimeout(() => {
      // solo dispara si el check-in de hoy sigue sin hacerse
      const raw = localStorage.getItem('lifeos2')
      if (!raw) return showReminder()
      const state = JSON.parse(raw)
      if (!state.entries?.[todayStr]) showReminder()
    }, ms)
    timers.push(id)
  }
}

function showReminder(): void {
  if (Notification.permission !== 'granted') return
  new Notification('LifeOS — check-in pendiente', {
    body: 'Son más de las 22:00. No olvides tu check-in de hoy.',
    icon: '/icons/icon-192.png',
    tag: 'lifeos-checkin',
  })
}

export function cancelReminders(): void {
  for (const id of timers) clearTimeout(id)
  timers.length = 0
}

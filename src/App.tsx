import { useState, useEffect } from 'react'
import { format, subDays, getDay, startOfWeek } from 'date-fns'
import { CheckinFlow } from './components/checkin/CheckinFlow'
import { ResultScreen } from './components/checkin/ResultScreen'
import { Dashboard } from './components/dashboard/Dashboard'
import { WeeklyReview } from './components/WeeklyReview'
import { Settings } from './components/Settings'
import { PesoScreen } from './components/peso/PesoScreen'
import { loadState, upsertEntry, addPesaje, addRevisionSemanal } from './lib/store'
import { scheduleReminders, cancelReminders } from './lib/notifications'
import { AppState, DayEntry, Pesaje } from './types'

type Screen =
  | 'checkin'
  | 'result'
  | 'weekly-review'
  | 'dashboard'
  | 'settings'
  | 'peso'
  | 'edit-yesterday'
  | 'edit-yesterday-result'

function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

function yesterdayString(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd')
}

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadState())
  const [screen, setScreen] = useState<Screen>(() => {
    const today = todayString()
    return appState.entries[today] ? 'dashboard' : 'checkin'
  })
  const [pendingEntry, setPendingEntry] = useState<DayEntry | null>(null)
  const [editingYesterday, setEditingYesterday] = useState(false)

  const todayStr = todayString()
  const yesterdayStr = yesterdayString()

  // Schedule notification reminders on load
  useEffect(() => {
    scheduleReminders(todayStr)
    return () => cancelReminders()
  }, [todayStr])

  function handleCheckinComplete(entry: DayEntry) {
    const newState = upsertEntry(appState, entry)
    setAppState(newState)
    setPendingEntry(entry)
    cancelReminders()
    setScreen('result')
  }

  function handleResultContinue() {
    const isSunday = getDay(new Date()) === 0
    if (isSunday && !editingYesterday) {
      setScreen('weekly-review')
    } else {
      setScreen('dashboard')
      setEditingYesterday(false)
    }
  }

  function handleEditYesterday() {
    setEditingYesterday(true)
    setScreen('edit-yesterday')
  }

  function handleEditYesterdayComplete(entry: DayEntry) {
    const newState = upsertEntry(appState, entry)
    setAppState(newState)
    setPendingEntry(entry)
    setScreen('edit-yesterday-result')
  }

  function handleWeeklyReviewContinue(respuesta: string) {
    const semanaInicio = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const newState = addRevisionSemanal(appState, {
      semanaInicio,
      respuesta,
      guardadaEn: new Date().toISOString(),
    })
    setAppState(newState)
    setScreen('dashboard')
  }

  function handleAddPesaje(pesaje: Pesaje) {
    setAppState(s => addPesaje(s, pesaje))
  }

  // Determine if we can show dashboard (today's check-in done)
  const todayEntry = appState.entries[todayStr]
  const yesterdayEntry = appState.entries[yesterdayStr]

  if (screen === 'checkin') {
    return (
      <CheckinFlow
        date={todayStr}
        state={appState}
        onComplete={handleCheckinComplete}
      />
    )
  }

  if (screen === 'result' && pendingEntry) {
    return (
      <ResultScreen
        entry={pendingEntry}
        state={appState}
        onContinue={handleResultContinue}
      />
    )
  }

  if (screen === 'edit-yesterday') {
    return (
      <div className="flex flex-col min-h-screen bg-surface-0">
        <div className="px-4 pt-safe-top pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => { setEditingYesterday(false); setScreen('dashboard') }}
            className="text-zinc-400 text-xl px-1"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-white">Check-in de ayer</h1>
        </div>
        <CheckinFlow
          date={yesterdayStr}
          initial={yesterdayEntry}
          state={appState}
          onComplete={handleEditYesterdayComplete}
        />
      </div>
    )
  }

  if ((screen === 'edit-yesterday-result') && pendingEntry) {
    return (
      <ResultScreen
        entry={pendingEntry}
        state={appState}
        onContinue={() => { setScreen('dashboard'); setEditingYesterday(false) }}
        isEditing
      />
    )
  }

  if (screen === 'weekly-review') {
    return (
      <WeeklyReview
        state={appState}
        todayStr={todayStr}
        onContinue={handleWeeklyReviewContinue}
      />
    )
  }

  if (screen === 'settings') {
    return (
      <Settings
        state={appState}
        onImport={newState => { setAppState(newState); setScreen('dashboard') }}
        onBack={() => setScreen('dashboard')}
      />
    )
  }

  if (screen === 'peso') {
    return (
      <PesoScreen
        state={appState}
        todayStr={todayStr}
        onAddPesaje={handleAddPesaje}
        onBack={() => setScreen('dashboard')}
      />
    )
  }

  // Dashboard — requires today's entry
  if (screen === 'dashboard' && todayEntry) {
    return (
      <Dashboard
        state={appState}
        todayStr={todayStr}
        todayEntry={todayEntry}
        yesterdayStr={yesterdayStr}
        canEditYesterday={true}
        onEditYesterday={handleEditYesterday}
        onSettings={() => setScreen('settings')}
        onOpenPeso={() => setScreen('peso')}
      />
    )
  }

  // Fallback: go to checkin
  return (
    <CheckinFlow
      date={todayStr}
      state={appState}
      onComplete={handleCheckinComplete}
    />
  )
}

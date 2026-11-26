import { useEffect } from 'react'
import './App.css'
import SetRoutes from './routes/routes'
import { startDailyReminder } from './services/notifications'
import { startThemeSync } from './services/theme'

function App() {
  useEffect(() => {
    const stopThemeSync = startThemeSync()
    const stopDailyReminder = startDailyReminder()
    return () => {
      stopThemeSync()
      stopDailyReminder()
    }
  }, [])

  return (
    <>
      <SetRoutes>
      </SetRoutes>
    </>
  )
}

export default App

import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDataStore } from './store/useStore'
import Layout from './components/Layout'
import MapPage from './pages/MapPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import RatingPage from './pages/RatingPage'
import VerificationPage from './pages/VerificationPage'
import CreateTaskPage from './pages/CreateTaskPage'
import TaskDetailPage from './pages/TaskDetailPage'

function App() {
  const loadData = useDataStore((s) => s.loadData)

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MapPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="rating" element={<RatingPage />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="create" element={<CreateTaskPage />} />
        <Route path="task/:id" element={<TaskDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

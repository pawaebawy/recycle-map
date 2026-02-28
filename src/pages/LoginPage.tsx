import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useDataStore } from '../store/useStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore((s) => s.login)
  const user = useAuthStore((s) => s.user)
  const loaded = useDataStore((s) => s.loaded)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!loaded) {
      setError('Данные ещё загружаются...')
      return
    }
    const ok = login(email, password)
    if (ok) {
      navigate('/')
    } else {
      setError('Неверный email или пароль')
    }
  }

  if (user) {
    navigate('/')
    return null
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Вход</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="user@test.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="123456"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium"
        >
          Войти
        </button>
      </form>
      <p className="mt-4 text-center text-stone-600 text-sm">
        Нет аккаунта?{' '}
        <Link to="/register" className="text-emerald-600 hover:underline">
          Зарегистрироваться
        </Link>
      </p>
      <p className="mt-2 text-center text-stone-500 text-xs">
        Тестовые: user@test.com / 123456 или verifier@test.com / 123456
      </p>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useDataStore } from '../store/useStore'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const register = useAuthStore((s) => s.register)
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
    const ok = register(email, password, name)
    if (ok) {
      navigate('/')
    } else {
      setError('Пользователь с таким email уже существует')
    }
  }

  if (user) {
    navigate('/')
    return null
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Регистрация</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Имя
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Иван Иванов"
          />
        </div>
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
            placeholder="email@example.com"
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
            minLength={6}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium"
        >
          Зарегистрироваться
        </button>
      </form>
      <p className="mt-4 text-center text-stone-600 text-sm">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-emerald-600 hover:underline">
          Войти
        </Link>
      </p>
    </div>
  )
}

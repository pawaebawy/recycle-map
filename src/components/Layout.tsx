import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useStore'
import { useCurrentUser } from '../hooks/useCurrentUser'

export default function Layout() {
  const authUser = useAuthStore((s) => s.user)
  const user = useCurrentUser() ?? authUser
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-emerald-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-lg">
            🌱 ЭкоЧек
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:bg-emerald-600 px-3 py-1 rounded">
              Карта
            </Link>
            <Link to="/rating" className="hover:bg-emerald-600 px-3 py-1 rounded">
              Рейтинг
            </Link>
            {user ? (
              <>
                {user.role === 'verifier' && (
                  <Link
                    to="/verification"
                    className="hover:bg-emerald-600 px-3 py-1 rounded"
                  >
                    Проверка
                  </Link>
                )}
                <Link
                  to="/create"
                  className="hover:bg-emerald-600 px-3 py-1 rounded"
                >
                  Создать задачу
                </Link>
                <Link
                  to="/profile"
                  className="hover:bg-emerald-600 px-3 py-1 rounded flex items-center gap-2"
                >
                  <span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm">
                    {user.name[0]}
                  </span>
                  {user.points} баллов
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:bg-emerald-600 px-3 py-1 rounded"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:bg-emerald-600 px-3 py-1 rounded">
                  Вход
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

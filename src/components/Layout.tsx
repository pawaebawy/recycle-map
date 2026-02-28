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
        <div className="max-w-6xl mx-auto px-3 sm:px-4 flex items-center justify-between min-h-14 py-2 gap-2">
          <Link to="/" className="font-bold text-base sm:text-lg shrink-0">
            🌱 ЭкоЧек
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            <Link to="/" className="hover:bg-emerald-600 px-2 sm:px-3 py-1 rounded text-sm">
              Карта
            </Link>
            <Link to="/rating" className="hover:bg-emerald-600 px-2 sm:px-3 py-1 rounded text-sm">
              Рейтинг
            </Link>
            {user ? (
              <>
                {user.role === 'verifier' && (
                  <Link
                    to="/verification"
                    className="hover:bg-emerald-600 px-2 sm:px-3 py-1 rounded text-sm"
                  >
                    Проверка
                  </Link>
                )}
                <Link
                  to="/create"
                  className="hover:bg-emerald-600 px-2 sm:px-3 py-1 rounded text-sm"
                >
                  Создать
                </Link>
                <Link
                  to="/profile"
                  className="hover:bg-emerald-600 px-2 sm:px-3 py-1 rounded flex items-center gap-1 text-sm"
                >
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs sm:text-sm shrink-0">
                    {user.name[0]}
                  </span>
                  <span className="hidden sm:inline">{user.points} б.</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:bg-emerald-600 px-2 sm:px-3 py-1 rounded text-sm"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:bg-emerald-600 px-2 sm:px-3 py-1 rounded text-sm">
                  Вход
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-500 hover:bg-emerald-600 px-2 sm:px-3 py-1 rounded text-sm"
                >
                  Рег.
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

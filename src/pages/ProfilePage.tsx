import { Link, Navigate } from 'react-router-dom'
import { useAuthStore, useDataStore } from '../store/useStore'
import { useCurrentUser } from '../hooks/useCurrentUser'

const REWARDS = [
  { id: '1', title: 'Скидка 10% в эко-магазине «Зелёный»', points: 50, desc: 'На любую покупку' },
  { id: '2', title: 'Кофе в подарок в «ЧайКофе»', points: 30, desc: 'При заказе от 200 ₽' },
  { id: '3', title: 'Бесплатная доставка Ozon', points: 100, desc: 'Один заказ' },
  { id: '4', title: 'Сертификат 500 ₽ в «ВкусВилл»', points: 200, desc: 'На продукты' },
  { id: '5', title: 'Годовой абонемент в парк', points: 500, desc: 'Бесплатное посещение' },
]

export default function ProfilePage() {
  const authUser = useAuthStore((s) => s.user)
  const user = useCurrentUser() ?? authUser
  const getTask = useDataStore((s) => s.getTask)

  if (!authUser) return <Navigate to="/login" replace />
  if (!user) return null

  const createdTasks = user.tasksCreated.map((id) => getTask(id)).filter(Boolean)
  const inProgressTasks = user.tasksInProgress.map((id) => getTask(id)).filter(Boolean)
  const completedTasks = user.tasksCompleted.map((id) => getTask(id)).filter(Boolean)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-3xl text-white font-bold">
          {user.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{user.name}</h1>
          <p className="text-stone-600">{user.email}</p>
          <p className="text-emerald-600 font-bold text-2xl mt-2">
            {user.points} баллов
          </p>
        </div>
      </div>

      {/* Где потратить баллы */}
      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">
          Где потратить баллы
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {REWARDS.map((r) => (
            <div
              key={r.id}
              className={`p-4 rounded-xl border ${
                user.points >= r.points
                  ? 'bg-white border-emerald-200 hover:border-emerald-400'
                  : 'bg-stone-50 border-stone-200 opacity-75'
              }`}
            >
              <p className="font-medium text-stone-800">{r.title}</p>
              <p className="text-sm text-stone-500">{r.desc}</p>
              <p className="mt-2 text-emerald-600 font-semibold">{r.points} баллов</p>
              {user.points >= r.points ? (
                <button className="mt-2 text-sm text-emerald-600 hover:underline">
                  Обменять →
                </button>
              ) : (
                <p className="mt-2 text-sm text-stone-400">
                  Нужно ещё {r.points - user.points} баллов
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">
            {user.tasksCreated.length}
          </p>
          <p className="text-stone-600 text-sm">Создано задач</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <p className="text-3xl font-bold text-blue-600">
            {user.tasksInProgress.length}
          </p>
          <p className="text-stone-600 text-sm">В работе</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">
            {user.tasksCompleted.length}
          </p>
          <p className="text-stone-600 text-sm">Выполнено</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <p className="text-3xl font-bold text-amber-600">{user.points}</p>
          <p className="text-stone-600 text-sm">Баллов</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">
          Задачи в работе
        </h2>
        {inProgressTasks.length === 0 ? (
          <p className="text-stone-500">Нет задач в работе</p>
        ) : (
          <div className="space-y-2">
            {inProgressTasks.map((task) => (
              <Link
                key={task!.id}
                to={`/task/${task!.id}`}
                className="block bg-white rounded-lg p-4 border border-stone-200 hover:border-emerald-300"
              >
                <p className="font-medium text-stone-800">{task!.title}</p>
                <p className="text-sm text-stone-500">
                  Загрузите фото «после» на странице задачи
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">
          Выполненные задачи
        </h2>
        {completedTasks.length === 0 ? (
          <p className="text-stone-500">Пока нет выполненных задач</p>
        ) : (
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <Link
                key={task!.id}
                to={`/task/${task!.id}`}
                className="block bg-white rounded-lg p-4 border border-stone-200 hover:border-emerald-300"
              >
                <p className="font-medium text-stone-800">{task!.title}</p>
                <p className="text-sm text-emerald-600">
                  +{task!.points ?? 10} баллов
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">
          Созданные задачи
        </h2>
        {createdTasks.length === 0 ? (
          <p className="text-stone-500">Вы ещё не создавали задач</p>
        ) : (
          <div className="space-y-2">
            {createdTasks.map((task) => (
              <Link
                key={task!.id}
                to={`/task/${task!.id}`}
                className="block bg-white rounded-lg p-4 border border-stone-200 hover:border-emerald-300 flex justify-between items-center"
              >
                <p className="font-medium text-stone-800">{task!.title}</p>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    task!.status === 'active'
                      ? 'bg-amber-100 text-amber-800'
                      : task!.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {task!.status === 'active' && 'Активна'}
                  {task!.status === 'in_progress' && 'В работе'}
                  {task!.status === 'pending_verification' && 'На проверке'}
                  {task!.status === 'completed' && 'Выполнена'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

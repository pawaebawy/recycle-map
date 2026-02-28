import { useDataStore } from '../store/useStore'

export default function RatingPage() {
  const data = useDataStore((s) => s.data)
  const loaded = useDataStore((s) => s.loaded)

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">Загрузка...</p>
      </div>
    )
  }

  const rankedUsers = [...data.users]
    .filter((u) => u.role !== 'verifier')
    .sort((a, b) => b.points - a.points)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Рейтинг</h1>
      <p className="text-stone-600 mb-6">
        Топ пользователей по баллам ({rankedUsers.length} участников)
      </p>
      <div className="space-y-2">
        {rankedUsers.map((user, i) => (
          <div
            key={user.id}
            className="flex items-center gap-4 bg-white rounded-xl p-4 border border-stone-200 shadow-sm"
          >
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                i === 0
                  ? 'bg-amber-500'
                  : i === 1
                    ? 'bg-stone-400'
                    : i === 2
                      ? 'bg-amber-700'
                      : 'bg-emerald-600'
              }`}
            >
              {i + 1}
            </span>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
              {user.name[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-800">{user.name}</p>
              <p className="text-sm text-stone-500">{user.email}</p>
            </div>
            <p className="text-xl font-bold text-emerald-600">{user.points}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

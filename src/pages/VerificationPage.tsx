import { Navigate } from 'react-router-dom'
import { useAuthStore, useDataStore } from '../store/useStore'

export default function VerificationPage() {
  const user = useAuthStore((s) => s.user)
  const data = useDataStore((s) => s.data)
  const verifyTask = useDataStore((s) => s.verifyTask)
  const getUser = useDataStore((s) => s.getUser)

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'verifier') return <Navigate to="/" replace />

  const pendingTasks = data.tasks.filter(
    (t) => t.status === 'pending_verification'
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Проверка задач</h1>
      <p className="text-stone-600">
        Задачи, ожидающие верификации. Подтвердите или отклоните.
      </p>
      {pendingTasks.length === 0 ? (
        <p className="text-stone-500 py-8">Нет задач на проверке</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {pendingTasks.map((task) => {
            const executor = task.takenBy ? getUser(task.takenBy) : null
            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden"
              >
                <div className="p-4 border-b">
                  <h2 className="font-bold text-stone-800">{task.title}</h2>
                  <p className="text-sm text-stone-600">{task.description}</p>
                  <p className="text-xs text-stone-500 mt-2">
                    Исполнитель: {executor?.name || '—'}
                  </p>
                  <p className="text-xs text-stone-500">
                    Координаты задачи: {task.lat.toFixed(5)}, {task.lng.toFixed(5)}
                  </p>
                  {task.photoAfterCoords && (
                    <p className="text-xs text-stone-500">
                      Координаты фото: {task.photoAfterCoords.lat.toFixed(5)},{' '}
                      {task.photoAfterCoords.lng.toFixed(5)}
                    </p>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-1">Фото до</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {(task.photosBefore ?? [task.photoBefore]).map((src, i) => (
                        <img key={i} src={src} alt={`До ${i + 1}`} className="h-32 w-32 object-cover rounded shrink-0" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-1">Фото после</p>
                    {(task.photosAfter ?? (task.photoAfter ? [task.photoAfter] : [])).length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto">
                        {(task.photosAfter ?? [task.photoAfter!]).map((src, i) => (
                          <img key={i} src={src} alt={`После ${i + 1}`} className="h-32 w-32 object-cover rounded shrink-0" />
                        ))}
                      </div>
                    ) : (
                      <div className="h-32 bg-stone-100 rounded flex items-center justify-center text-stone-400">
                        Нет фото
                      </div>
                    )}
                  </div>
                  {task.submitComment && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 mb-1">Комментарий исполнителя</p>
                      <p className="text-sm text-stone-700 p-2 bg-stone-50 rounded">{task.submitComment}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 p-4 border-t">
                  <button
                    onClick={() => verifyTask(task.id, true, user.id)}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium"
                  >
                    Подтвердить
                  </button>
                  <button
                    onClick={() => verifyTask(task.id, false, user.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

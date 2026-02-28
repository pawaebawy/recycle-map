import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuthStore, useDataStore } from '../store/useStore'
import type { Task } from '../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const getTask = useDataStore((s) => s.getTask)
  const takeTask = useDataStore((s) => s.takeTask)
  const data = useDataStore((s) => s.data)

  const task = id ? getTask(id) : null
  const [galleryIndex, setGalleryIndex] = useState(0)

  if (!id) return <Navigate to="/" replace />
  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Задача не найдена</p>
        <Link to="/" className="text-emerald-600 hover:underline mt-2 inline-block">
          Вернуться на карту
        </Link>
      </div>
    )
  }

  const points = task.points ?? 10
  const canTake = user && task.status === 'active'
  const isMine = user && task.takenBy === user.id
  const canSubmit = isMine && task.status === 'in_progress'

  const photosBefore = task.photosBefore ?? [task.photoBefore]
  const photosAfter = task.photosAfter ?? (task.photoAfter ? [task.photoAfter] : [])
  const gallery = [...photosBefore, ...photosAfter]

  const nearbyTasks = data.tasks
    .filter((t) => t.id !== task.id && t.status === 'active')
    .map((t) => ({
      task: t,
      dist: getDistance(task.lat, task.lng, t.lat, t.lng),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 4)

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        ← Назад к карте
      </Link>

      <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
        {/* Галерея */}
        <div className="relative">
          <div className="aspect-video bg-stone-100">
            <img
              src={gallery[galleryIndex] ?? task.photoBefore}
              alt={galleryIndex === 0 ? 'Фото мусора до' : 'Фото после уборки'}
              className="w-full h-full object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={`w-2 h-2 rounded-full ${
                    i === galleryIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-2">{task.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-stone-500">
              <span>📅 {formatDate(task.createdAt)}</span>
              <span className="font-semibold text-emerald-600">{points} баллов за уборку</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  task.status === 'active'
                    ? 'bg-amber-100 text-amber-800'
                    : task.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                }`}
              >
                {task.status === 'active' && 'Активна'}
                {task.status === 'in_progress' && 'В работе'}
                {task.status === 'pending_verification' && 'На проверке'}
                {task.status === 'completed' && 'Выполнена'}
              </span>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-stone-800 mb-2">Описание</h2>
            <p className="text-stone-600 whitespace-pre-wrap">{task.description}</p>
          </div>

          <div>
            <h2 className="font-semibold text-stone-800 mb-2">Местоположение</h2>
            <p className="text-stone-600 text-sm">
              {task.lat.toFixed(5)}, {task.lng.toFixed(5)}
            </p>
          </div>

          {/* Действия */}
          {canTake && (
            <button
              onClick={() => user && takeTask(task.id, user.id)}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium"
            >
              Забронировать (+{points} баллов)
            </button>
          )}

          {canSubmit && (
            <Link
              to={`/task/${task.id}/submit`}
              className="block w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium text-center"
            >
              Отправить на проверку
            </Link>
          )}

          {isMine && task.status === 'pending_verification' && (
            <p className="text-amber-600 font-medium p-4 bg-amber-50 rounded-lg">
              Задача на проверке. Ожидайте подтверждения.
            </p>
          )}
        </div>
      </div>

      {/* Ближайшие задачи */}
      {nearbyTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Задачи рядом</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {nearbyTasks.map(({ task: t, dist }) => (
              <Link
                key={t.id}
                to={`/task/${t.id}`}
                className="flex gap-3 p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-300"
              >
                <img
                  src={t.photoBefore}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-medium text-stone-800 truncate">{t.title}</p>
                  <p className="text-sm text-stone-500">
                    {(dist * 1000).toFixed(0)} м · {(t.points ?? 10)} баллов
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

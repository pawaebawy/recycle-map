import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuthStore, useDataStore } from '../store/useStore'

export default function SubmitTaskPage() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const getTask = useDataStore((s) => s.getTask)
  const completeTask = useDataStore((s) => s.completeTask)

  const task = id ? getTask(id) : null
  const [photos, setPhotos] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  if (!id) return <Navigate to="/" replace />
  if (!user) return <Navigate to="/login" replace />
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

  const isMine = task.takenBy === user.id
  const canSubmit = isMine && task.status === 'in_progress'

  if (!canSubmit) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Вы не можете отправить эту задачу на проверку</p>
        <Link to={`/task/${id}`} className="text-emerald-600 hover:underline mt-2 inline-block">
          Вернуться к задаче
        </Link>
      </div>
    )
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => setPhotos((prev) => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photos.length) {
      setError('Добавьте хотя бы одно фото')
      return
    }
    setError('')
    const coords = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true }
      )
    })
    if (!coords) {
      setError('Нужен доступ к геолокации')
      return
    }
    const ok = completeTask(task.id, { photos, comment }, coords)
    if (!ok) setError('Вы должны быть в радиусе 50 м от точки задачи')
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link
        to={`/task/${id}`}
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        ← Назад к задаче
      </Link>

      <h1 className="text-2xl font-bold text-stone-800 mb-2">Отправить на проверку</h1>
      <p className="text-stone-600 mb-6">{task.title}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Фото «после» (обязательно, можно несколько)
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handlePhotoChange}
            className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700"
          />
          {photos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} alt="" className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Комментарий (необязательно)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg"
            placeholder="Опишите выполненную работу..."
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!photos.length}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
        >
          Отправить на проверку
        </button>
      </form>
    </div>
  )
}

import { Link } from 'react-router-dom'
import type { Task } from '../types'
import { useAuthStore, useDataStore } from '../store/useStore'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  onClose?: () => void
  onComplete?: () => void
  showBackLink?: boolean
  isDetailPage?: boolean
}

export default function TaskCard({ task, onClose, onComplete, showBackLink, isDetailPage }: TaskCardProps) {
  const user = useAuthStore((s) => s.user)
  const takeTask = useDataStore((s) => s.takeTask)
  const completeTask = useDataStore((s) => s.completeTask)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const canTake = user && task.status === 'active'
  const isMine = user && task.takenBy === user.id
  const canComplete = isMine && task.status === 'in_progress'

  const handleTake = () => {
    if (user) takeTask(task.id, user.id)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleComplete = async () => {
    if (!photoFile || !user) return
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
      setError('Нужен доступ к геолокации. Разрешите и попробуйте снова.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const ok = completeTask(task.id, dataUrl, coords)
      if (ok) {
        onComplete?.()
      } else {
        setError('Вы должны быть в радиусе 50 м от точки задачи. Подойдите ближе.')
      }
    }
    reader.readAsDataURL(photoFile)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 max-w-md">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-stone-800">{task.title}</h2>
        {onClose ? (
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-2xl leading-none"
          >
            ×
          </button>
        ) : showBackLink ? (
          <Link to="/" className="text-stone-400 hover:text-stone-600 text-2xl leading-none">
            ×
          </Link>
        ) : null}
      </div>
      <img
        src={task.photoBefore}
        alt="До"
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <p className="text-stone-600 mb-2">{task.description}</p>
      <p className="text-sm text-stone-500 mb-4">
        Координаты: {task.lat.toFixed(5)}, {task.lng.toFixed(5)}
      </p>
      {!isDetailPage && (
        <Link
          to={`/task/${task.id}`}
          className="block mb-4 text-emerald-600 hover:underline text-sm font-medium"
        >
          Подробнее →
        </Link>
      )}
      <div className="flex gap-2 mb-4">
        <span
          className={`px-2 py-1 rounded text-sm ${
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

      {canTake && (
        <button
          onClick={handleTake}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium"
        >
          Взять задачу
        </button>
      )}

      {canComplete && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-stone-700">
            Загрузите фото «после». Ваша геолокация будет проверена (в радиусе 50 м).
          </p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700"
          />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Превью"
              className="w-full h-32 object-cover rounded"
            />
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            onClick={handleComplete}
            disabled={!photoFile}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
          >
            Выполнить задачу
          </button>
        </div>
      )}

      {isMine && task.status === 'pending_verification' && (
        <p className="text-amber-600 font-medium">
          Задача на проверке. Ожидайте подтверждения.
        </p>
      )}

      {task.status === 'completed' && task.photoAfter && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium text-stone-600 mb-2">Фото после:</p>
          <img
            src={task.photoAfter}
            alt="После"
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}
    </div>
  )
}


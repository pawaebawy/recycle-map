import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore, useDataStore } from '../store/useStore'
import MapComponent from '../components/Map'
import type { Task } from '../types'

export default function CreateTaskPage() {
  const user = useAuthStore((s) => s.user)
  const addTask = useDataStore((s) => s.addTask)
  const navigate = useNavigate()

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [points, setPoints] = useState(10)
  const [useGps, setUseGps] = useState(true)

  if (!user) return <Navigate to="/login" replace /> 

  const handleMapClick = (lat: number, lng: number) => {
    setCoords({ lat, lng })
    setUseGps(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !photo) return
    if (useGps && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const c = { lat: p.coords.latitude, lng: p.coords.longitude }
          submitTask(c)
        },
        () => {
          if (coords) submitTask(coords)
        }
      )
    } else if (coords) {
      submitTask(coords)
    }
  }

  const submitTask = (c: { lat: number; lng: number }) => {
    const task: Task = {
      id: 't' + Date.now(),
      creatorId: user!.id,
      title,
      description,
      lat: c.lat,
      lng: c.lng,
      photoBefore: photo!,
      status: 'active',
      takenBy: null,
      photoAfter: null,
      completedAt: null,
      verifiedBy: null,
      photoAfterCoords: null,
      points,
      createdAt: new Date().toISOString(),
    }
    addTask(task)
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Создать задачу</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">
            Укажите место на карте (клик) или используйте GPS
          </p>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={useGps}
              onChange={(e) => setUseGps(e.target.checked)}
            />
            Использовать мою геолокацию
          </label>
          <MapComponent
            tasks={[]}
            onMapClick={handleMapClick}
            showClickToAdd={true}
          />
          {coords && !useGps && (
            <p className="text-sm text-stone-500 mt-2">
              Выбрано: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Фото «до» (обязательно)
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            required
            className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700"
          />
          {photo && (
            <img
              src={photo}
              alt="Превью"
              className="mt-2 w-full max-w-xs h-32 object-cover rounded"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Заголовок
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="Мусор у парка"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Баллы за выполнение
          </label>
          <input
            type="number"
            min={5}
            max={50}
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="Куча пластиковых бутылок и упаковок"
          />
        </div>
        <button
          type="submit"
          disabled={!photo || !title || !description || (!coords && !useGps)}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
        >
          Создать задачу
        </button>
      </form>
    </div>
  )
}

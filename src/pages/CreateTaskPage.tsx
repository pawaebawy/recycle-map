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
  const [photos, setPhotos] = useState<string[]>([])
  const [useGps, setUseGps] = useState(true)

  if (!user) return <Navigate to="/login" replace /> 

  const handleMapClick = (lat: number, lng: number) => {
    setCoords({ lat, lng })
    setUseGps(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () =>
        setPhotos((prev) => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !photos.length) return
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
      photoBefore: photos[0]!,
      photosBefore: photos,
      status: 'active',
      takenBy: null,
      photoAfter: null,
      photosAfter: null,
      completedAt: null,
      verifiedBy: null,
      photoAfterCoords: null,
      points: 10,
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
            previewCoords={coords}
            initialZoom={13}
          />
          {coords && !useGps && (
            <p className="text-sm text-stone-500 mt-2">
              Выбрано: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Фото «до» (обязательно, можно несколько)
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
                  <img
                    src={p}
                    alt={`Фото ${i + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
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
          disabled={!photos.length || !title || !description || (!coords && !useGps)}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
        >
          Создать задачу
        </button>
      </form>
    </div>
  )
}

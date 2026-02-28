import { useState } from 'react'
import { useDataStore } from '../store/useStore'
import MapComponent from '../components/Map'
import TaskPreview from '../components/TaskPreview'
import type { Task } from '../types'

export default function MapPage() {
  const data = useDataStore((s) => s.data)
  const loaded = useDataStore((s) => s.loaded)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">Загрузка...</p>
      </div>
    )
  }

  const tasks = data.tasks

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Карта задач</h1>
        <p className="text-stone-600 mt-1">
          Жёлтые — активные (можно взять), зелёные — выполненные
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <MapComponent tasks={tasks} onTaskClick={setSelectedTask} />
        </div>
        {selectedTask && (
          <div className="lg:w-96 flex-shrink-0">
            <TaskPreview
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

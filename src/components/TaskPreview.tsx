import { Link } from 'react-router-dom'
import type { Task } from '../types'
import { useAuthStore, useDataStore } from '../store/useStore'
import { useEffect, useRef } from 'react'

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return 'Сегодня'
  if (diff < 172800000) return 'Вчера'
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн. назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface TaskPreviewProps {
  task: Task
  onClose?: () => void
}

export default function TaskPreview({ task, onClose }: TaskPreviewProps) {
  const user = useAuthStore((s) => s.user)
  const takeTask = useDataStore((s) => s.takeTask)
  const points = task.points ?? 10

  const canTake = user && task.status === 'active'

  const isLinkActive = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      isLinkActive.current = true;
    }, 250); // 250 мс достаточно, чтобы клик по метке не задел ссылку
    return () => clearTimeout(timer);
  }, []);

  const handleLinkClick = (e: React.MouseEvent) => {
    if (!isLinkActive.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="task-preview__wrap bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden max-w-sm">
      <Link to={`/task/${task.id}`} onClick={handleLinkClick} className="block">
        <img
          src={task.photoBefore}
          alt="Фото мусора"
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-bold text-stone-800 line-clamp-1">{task.title}</h3>
            {onClose && (
              <button
                onClick={(e) => { e.preventDefault(); onClose() }}
                className="text-stone-400 hover:text-stone-600 text-xl leading-none shrink-0"
              >
                ×
              </button>
            )}
          </div>
          <p className="text-sm text-stone-600 line-clamp-2 mb-2">{task.description}</p>
          <div className="flex gap-3 text-sm text-stone-500">
            <span>📅 {formatDate(task.createdAt)}</span>
            <span className="font-semibold text-emerald-600">{points} баллов</span>
          </div>
        </div>
      </Link>
      {canTake && (
        <div className="px-4 pb-4">
          <button
            onClick={() => user && takeTask(task.id, user.id)}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium text-sm"
          >
            Забронировать
          </button>
        </div>
      )}
      {user && task.takenBy === user.id && task.status === 'in_progress' && (
        <div className="px-4 pb-4">
          <Link
            to={`/task/${task.id}/submit`}
            className="block w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 font-medium text-sm text-center"
          >
            Отправить на проверку
          </Link>
        </div>
      )}
    </div>
  )
}

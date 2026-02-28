import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Task, AppData } from '../types'

const VERIFICATION_RADIUS_M = 50
const METERS_TO_DEG = 1 / 111320 // ~1 meter in degrees at equator

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (email: string, password: string, name: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      login: (email, password) => {
        const data = useDataStore.getState().data
        const user = data.users.find(
          (u) => u.email === email && u.password === password
        )
        if (user) {
          set({ user: { ...user } })
          return true
        }
        return false
      },
      logout: () => set({ user: null }),
      register: (email, password, name) => {
        const data = useDataStore.getState().data
        if (data.users.some((u) => u.email === email)) return false
        const newUser: User = {
          id: 'u' + Date.now(),
          email,
          password,
          name,
          avatar: null,
          points: 0,
          role: 'user',
          tasksCreated: [],
          tasksCompleted: [],
          tasksInProgress: [],
        }
        useDataStore.getState().addUser(newUser)
        set({ user: newUser })
        return true
      },
    }),
    { name: 'auth' }
  )
)

interface DataState {
  data: AppData
  loaded: boolean
  loadData: () => Promise<void>
  addUser: (user: User) => void
  addTask: (task: Task) => void
  takeTask: (taskId: string, userId: string) => void
  completeTask: (taskId: string, photoAfter: string, coords: { lat: number; lng: number }) => boolean
  verifyTask: (taskId: string, approved: boolean, verifierId: string) => void
  getTask: (id: string) => Task | undefined
  getUser: (id: string) => User | undefined
}

const initialData: AppData = {
  users: [],
  tasks: [],
}

export const useDataStore = create<DataState>((set, get) => ({
  data: initialData,
  loaded: false,
  loadData: async () => {
    const migrate = (d: AppData) => ({
      ...d,
      tasks: d.tasks.map((t) => ({
        ...t,
        points: t.points ?? 10,
        createdAt: t.createdAt ?? t.completedAt ?? new Date().toISOString(),
      })),
    })
    const stored = localStorage.getItem('app-data')
    if (stored) {
      try {
        const parsed = migrate(JSON.parse(stored))
        set({ data: parsed, loaded: true })
        return
      } catch {}
    }
    try {
      const res = await fetch('/data.json')
      const data = migrate(await res.json())
      localStorage.setItem('app-data', JSON.stringify(data))
      set({ data, loaded: true })
    } catch {
      set({ data: initialData, loaded: true })
    }
  },
  addUser: (user) => {
    set((s) => {
      const data = { ...s.data, users: [...s.data.users, user] }
      localStorage.setItem('app-data', JSON.stringify(data))
      return { data }
    })
  },
  addTask: (task) => {
    set((s) => {
      const data = {
        ...s.data,
        tasks: [task, ...s.data.tasks],
        users: s.data.users.map((u) =>
          u.id === task.creatorId
            ? { ...u, tasksCreated: [...u.tasksCreated, task.id] }
            : u
        ),
      }
      localStorage.setItem('app-data', JSON.stringify(data))
      return { data }
    })
  },
  takeTask: (taskId, userId) => {
    set((s) => {
      const task = s.data.tasks.find((t) => t.id === taskId)
      if (!task || task.status !== 'active') return s
      const data = {
        ...s.data,
        tasks: s.data.tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: 'in_progress' as const, takenBy: userId }
            : t
        ),
        users: s.data.users.map((u) =>
          u.id === userId
            ? { ...u, tasksInProgress: [...u.tasksInProgress, taskId] }
            : u
        ),
      }
      localStorage.setItem('app-data', JSON.stringify(data))
      return { data }
    })
  },
  completeTask: (taskId, photoAfter, coords) => {
    const task = get().data.tasks.find((t) => t.id === taskId)
    if (!task || task.status !== 'in_progress') return false
    const dist =
      Math.sqrt(
        Math.pow((coords.lat - task.lat) / METERS_TO_DEG, 2) +
          Math.pow((coords.lng - task.lng) / METERS_TO_DEG, 2)
      ) * 111320
    if (dist > VERIFICATION_RADIUS_M) return false
    set((s) => {
      const data = {
        ...s.data,
        tasks: s.data.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'pending_verification' as const,
                photoAfter,
                photoAfterCoords: coords,
                completedAt: new Date().toISOString(),
              }
            : t
        ),
        users: s.data.users.map((u) =>
          u.id === task.takenBy
            ? {
                ...u,
                tasksInProgress: u.tasksInProgress.filter((id) => id !== taskId),
              }
            : u
        ),
      }
      localStorage.setItem('app-data', JSON.stringify(data))
      return { data }
    })
    return true
  },
  verifyTask: (taskId, approved, verifierId) => {
    set((s) => {
      const task = s.data.tasks.find((t) => t.id === taskId)
      if (!task || task.status !== 'pending_verification') return s
      if (approved) {
        const data = {
          ...s.data,
          tasks: s.data.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'completed' as const, verifiedBy: verifierId }
              : t
          ),
          users: s.data.users.map((u) =>
            u.id === task.takenBy
              ? {
                  ...u,
                  tasksCompleted: [...u.tasksCompleted, taskId],
                  points: u.points + (task.points ?? 10),
                }
              : u
          ),
        }
        localStorage.setItem('app-data', JSON.stringify(data))
        return { data }
      } else {
        const data = {
          ...s.data,
          tasks: s.data.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'active' as const,
                  takenBy: null,
                  photoAfter: null,
                  photoAfterCoords: null,
                  completedAt: null,
                }
              : t
          ),
          users: s.data.users.map((u) =>
            u.id === task.takenBy
              ? { ...u, tasksInProgress: u.tasksInProgress.filter((id) => id !== taskId) }
              : u
          ),
        }
        localStorage.setItem('app-data', JSON.stringify(data))
        return { data }
      }
    })
  },
  getTask: (id) => get().data.tasks.find((t) => t.id === id),
  getUser: (id) => get().data.users.find((u) => u.id === id),
}))

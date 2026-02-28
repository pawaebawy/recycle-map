import { useAuthStore, useDataStore } from '../store/useStore'

export function useCurrentUser() {
  const authUser = useAuthStore((s) => s.user)
  const users = useDataStore((s) => s.data.users)
  return authUser ? users.find((u) => u.id === authUser.id) ?? authUser : null
}

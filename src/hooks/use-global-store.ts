import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Store = {
  session: {
    token: string
    account_id: string
    session_id: string
    github_username: string
  } | null
  setSession: (session: Store["session"]) => any
}

export const useGlobalStore = create<Store>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    {
      name: "session_store",
    },
  ),
)

useGlobalStore.subscribe((state, prevState) => {
  ;(window as any).globalStore = state
})

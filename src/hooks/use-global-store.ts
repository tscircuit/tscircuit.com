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
  should_onboarding_tips_be_closed: boolean
  setOnboardingTipsClosed: (closed: boolean) => any
}

export const useGlobalStore = create<Store>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      should_onboarding_tips_be_closed: false,
      setOnboardingTipsClosed: (closed) =>
        set({ should_onboarding_tips_be_closed: closed }),
    }),
    {
      name: "session_store",
    },
  ),
)

if (typeof window !== "undefined") {
  useGlobalStore.subscribe((state) => {
    ;(window as any).globalStore = state
    window.TSCIRCUIT_REGISTRY_TOKEN = state.session?.token ?? null
  })
}

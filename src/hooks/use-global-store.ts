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
  lastVisitedUrl: string
  setLastVisitedUrl: (url: string) => any
  codeState: string | null
  setCodeState: (code: string | null) => any
}

export const useGlobalStore = create<Store>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      should_onboarding_tips_be_closed: false,
      setOnboardingTipsClosed: (closed) =>
        set({ should_onboarding_tips_be_closed: closed }),
      lastVisitedUrl: "",
      setLastVisitedUrl: (url) => set({ lastVisitedUrl: url }),
      codeState: null,
      setCodeState: (code) => set({ codeState: code }),
    }),
    {
      name: "session_store",
    },
  ),
)

useGlobalStore.subscribe((state, prevState) => {
  ;(window as any).globalStore = state
})

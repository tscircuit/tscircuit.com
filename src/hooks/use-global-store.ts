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
  should_use_webworker_for_run?: boolean
  setShouldUseWebworkerForRun: (should_use_webworker_for_run: boolean) => any
  setOnboardingTipsClosed: (closed: boolean) => any
}

export const useGlobalStore = create<Store>()(
  persist(
    (set) => ({
      session: null,
      should_use_webworker_for_run: false,
      setShouldUseWebworkerForRun: (should_use_webworker_for_run: boolean) =>
        set({ should_use_webworker_for_run }),
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

useGlobalStore.subscribe((state, prevState) => {
  ;(window as any).globalStore = state
})

import { AnyCircuitElement } from "circuit-json"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface snippetInfo {
  circuitJson?: AnyCircuitElement[] | null
  code: string
  snippetType: "board" | "package" | "model" | "footprint"
  manual_edits_json_content: string | null
}
export type Store = {
  guestSnippet: snippetInfo | null
  session: {
    token: string
    account_id: string
    session_id: string
    github_username: string
  } | null
  setGuestSnippet: (sessionInfo: Store["guestSnippet"]) => void
  setSession: (session: Store["session"]) => any
  should_onboarding_tips_be_closed: boolean
  setOnboardingTipsClosed: (closed: boolean) => any
}

export const useGlobalStore = create<Store>()(
  persist(
    (set) => ({
      session: null,
      guestSnippet: null,
      setSession: (session) => set({ session }),
      setGuestSnippet: (guestSnippet) => set({ guestSnippet }),
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

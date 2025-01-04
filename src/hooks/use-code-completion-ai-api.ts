import { useMemo } from "react"
import { useGlobalStore } from "./use-global-store"

export const useCodeCompletionApi = () => {
  const sessionToken = useGlobalStore((state) => state.session?.token)
  const codeiumApiKey = useMemo(() => {
    if (import.meta.env.VITE_USE_DIRECT_AI_REQUESTS === "true") {
      console.warn(
        "Direct AI requests are enabled. Do not use this in production.",
      )
    }
    return import.meta.env.VITE_USE_DIRECT_AI_REQUESTS === "true"
      ? {
          apiKey: import.meta.env.VITE_CODIUM_API_KEY,
        }
      : {
          apiKey: "{REPLACE_ON_SERVER}",
        }
  }, [])

  return codeiumApiKey
}

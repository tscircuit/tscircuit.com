import { useMemo } from "react"

export const useCodeCompletionApi = () => {
  const openrouterApiKey = useMemo(() => {
    return {
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    }
  }, [])

  return openrouterApiKey
}

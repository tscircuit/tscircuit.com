import { useMemo } from "react"

export const useCodeCompletionApi = () => {
  const codeiumApiKey = useMemo(() => {
    return {
      apiKey: import.meta.env.VITE_CODIUM_API_KEY,
    }
  }, [])

  return codeiumApiKey
}

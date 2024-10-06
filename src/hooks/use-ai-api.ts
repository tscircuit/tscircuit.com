import { Anthropic } from "@anthropic-ai/sdk"
import { useMemo } from "react"
import { useGlobalStore } from "./use-global-store"

export const useAiApi = ({
  streaming = false,
}: { streaming?: boolean } = {}) => {
  const sessionToken = useGlobalStore((state) => state.session?.token)
  const anthropic = useMemo(
    () =>
      new Anthropic({
        apiKey: "{REPLACE_ON_SERVER}",
        // apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
        // baseURL: `${window.location.origin}/ai`,
        baseURL: import.meta.env.VITE_SNIPPETS_API_URL
          ? `${import.meta.env.VITE_SNIPPETS_API_URL}/anthropic`
          : "/api/anthropic",
        defaultHeaders: {
          Authorization: `Bearer ${sessionToken}`,
        },
        dangerouslyAllowBrowser: true,
      }),
    [],
  )

  return anthropic
}

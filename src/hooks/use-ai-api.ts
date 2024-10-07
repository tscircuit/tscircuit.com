import { Anthropic } from "@anthropic-ai/sdk"
import { useMemo } from "react"
import { useGlobalStore } from "./use-global-store"

export const useAiApi = ({
  streaming = false,
}: { streaming?: boolean } = {}) => {
  const sessionToken = useGlobalStore((state) => state.session?.token)
  const anthropic = useMemo(
    () =>
      new Anthropic(
        import.meta.env.USE_DIRECT_AI_REQUESTS === "true"
          ? {
              apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
              dangerouslyAllowBrowser: true,
            }
          : {
              apiKey: "{REPLACE_ON_SERVER}",
              baseURL: import.meta.env.VITE_SNIPPETS_API_URL
                ? `${import.meta.env.VITE_SNIPPETS_API_URL}/anthropic`
                : "/api/anthropic",
              defaultHeaders: {
                Authorization: `Bearer ${sessionToken}`,
              },
              dangerouslyAllowBrowser: true,
            },
      ),
    [],
  )

  return anthropic
}

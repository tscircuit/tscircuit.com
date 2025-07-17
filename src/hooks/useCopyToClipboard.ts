import { useToast } from "@/hooks/useToast"
import { useCallback } from "react"

export const useCopyToClipboard = () => {
  const { toast } = useToast()

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        toast({
          title: "Copied to clipboard!",
          description: "The text has been copied successfully.",
        })
      } catch (error) {
        toast({
          title: "Failed to copy",
          description: "There was an error copying the text.",
        })
      }
    },
    [toast],
  )

  return { copyToClipboard }
}

import { GitHubLogoIcon, MagicWandIcon } from "@radix-ui/react-icons"
import { ClipboardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAiApi } from "@/hooks/use-ai-api"
import { useAsyncMemo } from "use-async-memo"
import { encodeTextToUrlHash } from "@/lib/encodeTextToUrlHash"
interface TextBlock {
  text: string
  type: "text"
}
export const ErrorTabContent = ({
  code,
  isStreaming,
  errorMessage,
}: {
  code?: string
  isStreaming?: boolean
  errorMessage?: string | null
}) => {
  const anthropic = useAiApi()
  const simplifiedErrorMessage = useAsyncMemo(async () => {
    if (isStreaming) return ""
    if (!code) return ""
    if (!errorMessage) return ""
    // Only simplify for ZodErrors for now
    if (!errorMessage.includes("ZodError")) return ""
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `
You are a helpful assistant that simplifies error messages. You only output the rewritten error message.

Here is the code:
${code}

Here is the error message:
${errorMessage}
          `.trim(),
        },
      ],
    })
    return (response.content[0] as TextBlock).text
  }, [code, errorMessage, isStreaming])

  if (!errorMessage) {
    return (
      <div className="mt-4 bg-green-50 rounded-md border border-green-200">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            No Errors 👌
          </h3>
          <p className="text-sm text-green-700">
            Your code is running without any errors.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mt-4 bg-red-50 rounded-md border border-red-200 max-h-[500px] overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-3">Error</h3>
          <p className="text-xs font-semibold font-mono whitespace-pre-wrap text-red-700">
            {simplifiedErrorMessage}
          </p>
          <p className="text-xs font-mono whitespace-pre-wrap text-red-600 mt-2">
            {errorMessage}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <Button
          variant="outline"
          onClick={() => {
            if (!errorMessage) return
            navigator.clipboard.writeText(errorMessage)
            alert("Error copied to clipboard!")
          }}
        >
          <ClipboardIcon className="w-4 h-4 mr-2" />
          Copy Error
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const title = `Error: ${errorMessage
              .replace("Render Error:", "")
              .replace(/\"_errors\":\[\]/g, "")
              .replace(/\{,/g, "{")
              .replace(/"_errors":\[/g, "")
              .replace(/[^a-zA-Z0-9 ]/g, " ")
              .replace(/\s+/g, " ")
              .replace(/ \d+ /g, " ")
              .slice(0, 100)}`
            const url = encodeTextToUrlHash(code ?? "").replace(
              "http://localhost:5173",
              "https://snippets.tscircuit.com",
            )
            let body = `[Snippet code to reproduce](${url})\n\n### Error\n\`\`\`\n${errorMessage.slice(0, 600)}\n\`\`\``
            if (body.length > 4000) {
              body = `\`\`\`tsx\n// Please paste the code here\`\`\`\n\n### Error\n\`\`\`\n${errorMessage.slice(0, 2000)}\n\`\`\``
            }
            window.open(
              `https://github.com/tscircuit/tscircuit.com/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`,
              "_blank",
            )
          }}
        >
          <GitHubLogoIcon className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
        <Button variant="outline">
          <MagicWandIcon className="w-4 h-4 mr-2" />
          Fix with AI
        </Button>
      </div>
    </>
  )
}

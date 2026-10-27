import { useMemo, useState } from "react"
import { Copy } from "lucide-react"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { abbreviateComponentTsx } from "@/lib/datasheet-component-tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const DatasheetComponentTsx = ({ source }: { source: string }) => {
  const { highlighter } = useShikiHighlighter()
  const { copyToClipboard } = useCopyToClipboard()
  const [isExpanded, setIsExpanded] = useState(false)
  const display = useMemo(
    () => (isExpanded ? source : abbreviateComponentTsx(source)),
    [source, isExpanded],
  )
  const tokens = useMemo(
    () =>
      highlighter?.codeToTokens(display, { lang: "tsx", theme: "github-light" })
        .tokens,
    [highlighter, display],
  )
  return (
    <Card className="mb-6 min-w-0">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-xl font-semibold">Component TSX</CardTitle>
        <Button variant="outline" onClick={() => copyToClipboard(source)}>
          <Copy className="mr-2 h-4 w-4" /> Copy component TSX
        </Button>
      </CardHeader>
      <CardContent>
        <pre
          className={`overflow-auto rounded-md bg-slate-50 p-4 text-sm ${isExpanded ? "" : "max-h-96 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"}`}
          aria-label="Component TSX source"
          role={isExpanded ? undefined : "button"}
          tabIndex={isExpanded ? undefined : 0}
          aria-expanded={isExpanded}
          title={isExpanded ? undefined : "Click to expand full TSX"}
          onClick={() => setIsExpanded(true)}
          onKeyDown={(event) => {
            if (!isExpanded && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault()
              setIsExpanded(true)
            }
          }}
        >
          <code>
            {tokens
              ? tokens.map((line, index) => (
                  <span key={index}>
                    {line.map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        data-syntax-token
                        style={{ color: token.color }}
                      >
                        {token.content}
                      </span>
                    ))}
                    {index < tokens.length - 1 ? "\n" : null}
                  </span>
                ))
              : display}
          </code>
        </pre>
      </CardContent>
    </Card>
  )
}

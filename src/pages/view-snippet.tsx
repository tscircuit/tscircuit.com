import { DownloadButtonAndMenu } from "@/components/DownloadButtonAndMenu"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import ViewSnippetHeader from "@/components/ViewSnippetHeader"
import ViewSnippetSidebar from "@/components/ViewSnippetSidebar"
import { useCurrentSnippet } from "@/hooks/use-current-snippet"
import { useRunTsx } from "@/hooks/use-run-tsx"
import { encodeTextToUrlHash } from "@/lib/encodeTextToUrlHash"
import { Share } from "lucide-react"
import { useParams } from "wouter"
import { PreviewContent } from "@/components/PreviewContent"

export const ViewSnippetPage = () => {
  const { author, snippetName } = useParams()
  const { snippet } = useCurrentSnippet()

  const { circuitJson, message, triggerRunTsx, tsxRunTriggerCount } = useRunTsx(
    {
      code: snippet?.code ?? "",
      type: snippet?.snippet_type,
    },
  )

  return (
    <div>
      <Header />
      <ViewSnippetHeader />
      <div className="flex">
        <div className="flex-grow">
          <PreviewContent
            code={snippet?.code ?? ""}
            triggerRunTsx={triggerRunTsx}
            tsxRunTriggerCount={tsxRunTriggerCount}
            errorMessage={message}
            circuitJson={circuitJson}
            showCodeTab={true}
            showJsonTab={false}
            readOnly
            headerClassName="p-4 border-b border-gray-200"
            leftHeaderContent={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    if (!snippet) return
                    const url = encodeTextToUrlHash(snippet.code)
                    navigator.clipboard.writeText(url)
                    alert("URL copied to clipboard!")
                  }}
                >
                  <Share className="mr-1 h-3 w-3" />
                  Copy URL
                </Button>
                <DownloadButtonAndMenu
                  snippetUnscopedName={snippet?.unscoped_name}
                  circuitJson={circuitJson}
                  className="hidden md:flex"
                />
              </>
            }
            isStreaming={false}
            onCodeChange={() => {}}
            onDtsChange={() => {}}
          />
        </div>
        <ViewSnippetSidebar />
      </div>
    </div>
  )
}

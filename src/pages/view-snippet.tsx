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
import Footer from "@/components/Footer"
import { Helmet } from "react-helmet"

export const ViewSnippetPage = () => {
  const { author, snippetName } = useParams()
  const { snippet, error: snippetError, isLoading } = useCurrentSnippet()

  const { circuitJson, message, triggerRunTsx, tsxRunTriggerCount } = useRunTsx(
    {
      code: snippet?.code ?? "",
      type: snippet?.snippet_type,
    },
  )

  return (
    <>
      <Helmet>
        <title>{`tscircuit - ${author}/${snippetName}`}</title>
      </Helmet>
      <div>
        <Header />
        {isLoading && <div>Loading...</div>}
        {snippetError && snippetError.status === 404 && (
          <div className="text-gray-500 flex items-center justify-center h-64">
            Snippet not found: {author}/{snippetName}
          </div>
        )}
        {snippetError && snippetError.status !== 404 && (
          <div>Error: {snippetError.toString()}</div>
        )}
        {snippet && (
          <>
            <ViewSnippetHeader />
            <div className="flex h-[calc(100vh-120px)]">
              <div className="flex-grow overflow-hidden">
                <PreviewContent
                  className="h-full"
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
          </>
        )}
        <Footer />
      </div>
    </>
  )
}

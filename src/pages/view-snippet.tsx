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
import { useEffect, useState } from "react"
import type { AnyCircuitElement } from "circuit-json"
import StaticViewSnippetHeader from "../components/StaticViewSnippetHeader"
import StaticPreviewContent from "../components/StaticPreviewContent"
import StaticViewSnippetSidebar from "../components/StaticViewSnippetSidebar"

export const ViewSnippetPage = () => {
  const { author, snippetName } = useParams()
  const { snippet, error: snippetError, isLoading } = useCurrentSnippet()
  const [initialCircuitJson, setInitialCircuitJson] = useState<any>(null)

  const {
    circuitJson,
    message,
    triggerRunTsx,
    isRunningCode,
    tsxRunTriggerCount,
    setTsxResult,
    circuitJsonKey,
  } = useRunTsx({
    code: snippet?.code ?? "",
    type: snippet?.snippet_type,
  })

  useEffect(() => {
    if (snippet?.circuit_json && !initialCircuitJson) {
      setInitialCircuitJson(snippet.circuit_json)
      setTsxResult({
        compiledModule: null,
        message: "",
        circuitJson: snippet.circuit_json as AnyCircuitElement[],
        isRunningCode: false,
      })
    }
  }, [snippet, initialCircuitJson, setTsxResult])

  return (
    <>
      <Helmet>
        <title>{`tscircuit - ${author}/${snippetName}`}</title>
      </Helmet>
      <div>
        <Header />
        {isLoading && (
          <>
            <StaticViewSnippetHeader
              author={author as string}
              snippetName={snippetName as string}
            />
            <div className="flex flex-row min-h-full">
              <div className="flex-grow overflow-auto">
                <StaticPreviewContent />
              </div>
              <StaticViewSnippetSidebar />
            </div>
          </>
        )}
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
            <div className="flex flex-row min-h-full">
              <div className="flex-grow overflow-auto">
                <PreviewContent
                  className="h-full"
                  code={snippet?.code ?? ""}
                  triggerRunTsx={triggerRunTsx}
                  tsxRunTriggerCount={tsxRunTriggerCount}
                  errorMessage={message}
                  circuitJson={circuitJson}
                  circuitJsonKey={circuitJsonKey}
                  isRunningCode={isRunningCode}
                  showCodeTab={true}
                  showJsonTab={false}
                  showImportAndFormatButtons={false}
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

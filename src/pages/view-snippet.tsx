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
import type { AnyCircuitElement } from "circuit-json"
import StaticViewSnippetHeader from "../components/StaticViewSnippetHeader"
import StaticPreviewContent from "../components/StaticPreviewContent"
import StaticViewSnippetSidebar from "../components/StaticViewSnippetSidebar"
import { useEffect, useMemo, useState } from "react"
import { parseJsonOrNull } from "@/lib/utils/parseJsonOrNull"
import { CircuitJsonPreview } from "@tscircuit/runframe/preview"

export const ViewSnippetPage = () => {
  const { author, snippetName } = useParams()
  const { snippet, error: snippetError, isLoading } = useCurrentSnippet()

  const [manualEditsFileContent, setManualEditsFileContent] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (snippet?.manual_edits_json_content) {
      setManualEditsFileContent(snippet.manual_edits_json_content ?? "")
    }
  }, [Boolean(snippet?.manual_edits_json_content)])

  const userImports = useMemo(
    () => ({
      "./manual-edits.json": parseJsonOrNull(manualEditsFileContent) ?? "",
    }),
    [manualEditsFileContent],
  )

  const {
    circuitJson: tsxResultCircuitJson,
    message,
    triggerRunTsx,
    isRunningCode,
    tsxRunTriggerCount,
    circuitJsonKey: tsxResultCircuitJsonKey,
  } = useRunTsx({
    code: snippet?.code ?? "",
    type: snippet?.snippet_type,
    userImports,
  })

  const circuitJsonForPreview = tsxResultCircuitJson ?? snippet?.circuit_json
  const circuitJsonKeyForPreview = tsxResultCircuitJson
    ? tsxResultCircuitJsonKey
    : snippet?.circuit_json
      ? "snippet"
      : ""

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
                <CircuitJsonPreview
                  className="h-full"
                  code={snippet?.code ?? ""}
                  errorMessage={message}
                  circuitJson={circuitJsonForPreview}
                  circuitJsonKey={circuitJsonKeyForPreview}
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
                        circuitJson={
                          circuitJsonForPreview as AnyCircuitElement[]
                        }
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

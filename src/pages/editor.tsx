import { CodeAndPreview } from "@/components/CodeAndPreview"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useCurrentSnippetId } from "@/hooks/use-current-snippet-id"
import { useSnippet } from "@/hooks/use-snippet"

export const EditorPage = () => {
  const { snippetId } = useCurrentSnippetId()
  const { data: snippet, isLoading, error } = useSnippet(snippetId)

  return (
    <div className="overflow-x-hidden">
      <Header />
      {!error && <CodeAndPreview snippet={snippet} />}
      {error && error.status === 404 && (
        <div className="w-full h-[calc(100vh-20rem)] text-xl text-center flex justify-center items-center">
          Snippet not found
        </div>
      )}
      {error && error.status !== 404 && (
        <div className="flex flex-col">
          Something strange happened<div>{error.message}</div>
        </div>
      )}
      <Footer />
    </div>
  )
}

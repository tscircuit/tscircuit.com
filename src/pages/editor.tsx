import { CodeAndPreview } from "@/components/CodeAndPreview"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useCurrentSnippetId } from "@/hooks/use-current-snippet-id"
import { useSnippet } from "@/hooks/use-snippet"
import { Helmet } from "react-helmet-async"

export const EditorPage = () => {
  const { snippetId } = useCurrentSnippetId()
  const { data: snippet, isLoading, error } = useSnippet(snippetId)

  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <title>
          {snippet
            ? `${snippet.unscoped_name} - tscircuit`
            : "tscircuit editor"}
        </title>
        {snippet && (
          <>
            <meta
              property="og:title"
              content={`${snippet.unscoped_name} - tscircuit`}
            />
            <meta
              property="og:image"
              content={`https://registry-api.tscircuit.com/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.png`}
            />
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              name="twitter:image"
              content={`https://registry-api.tscircuit.com/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.png`}
            />
          </>
        )}
      </Helmet>
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

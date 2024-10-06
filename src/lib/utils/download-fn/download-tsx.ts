import { useCurrentSnippetId } from "@/hooks/use-current-snippet-id"
import { useSnippet } from "@/hooks/use-snippet"

export const DownloadTSX = () => {
  const snippetId = useCurrentSnippetId()
  const { data: snippet, isLoading } = useSnippet(snippetId)

  return {
    TSXContent: snippet?.code as string,
    TSXFileName: `${snippet?.name}.tsx`,
  }
}

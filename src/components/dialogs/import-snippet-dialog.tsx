import { Snippet } from "fake-snippets-api/lib/db/schema"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"

export const ImportSnippetDialog = ({
  open,
  onOpenChange,
  onSnippetSelected,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSnippetSelected: (snippet: Snippet) => any
}) => {
  const [searchText, setSearchText] = useState("")
  const axios = useAxios()
  const { data: snippets, isLoading } = useQuery(
    ["snippetSearch", searchText],
    async () => {
      const response = await axios.get(`/snippets/search?q=${searchText}`)
      return response.data.snippets.slice(0, 12)
    },
    {
      enabled: searchText.length > 0,
    },
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Snippet</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search snippets..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ul>
            {snippets?.map((snippet: Snippet) => (
              <li key={snippet.snippet_id}>
                <Button onClick={() => onSnippetSelected(snippet)}>
                  {snippet.name}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}

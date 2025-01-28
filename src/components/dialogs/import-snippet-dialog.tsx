import { useAxios } from "@/hooks/use-axios"
import { useDebounce } from "@/hooks/use-debounce"
import type { Snippet } from "fake-snippets-api/lib/db/schema"
import { useState } from "react"
import { useQuery } from "react-query"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { createUseDialog } from "./create-use-dialog"

export const ImportSnippetDialog = ({
  open,
  onOpenChange,
  onSnippetSelected,
}: {
  open: boolean
  onOpenChange: (open: boolean) => any
  onSnippetSelected: (snippet: Snippet) => any
}) => {
  const [searchText, setSearchText] = useState("")
  const debouncedSearch = useDebounce(searchText, 300)
  const axios = useAxios()
  const { data: snippets, isLoading } = useQuery(
    ["snippetSearch", debouncedSearch],
    async () => {
      const response = await axios.get(`/snippets/search?q=${debouncedSearch}`)
      return response.data.snippets.slice(0, 12)
    },
    {
      enabled: debouncedSearch.length > 0,
    },
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100]">
        <DialogHeader>
          <DialogTitle>Import Snippet</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search snippets..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="h-64 overflow-y-auto">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <ul className="w-full">
              {snippets?.map((snippet: Snippet) => (
                <li
                  className="flex items-center my-1 text-xs w-full"
                  key={snippet.snippet_id}
                >
                  <a
                    href={`/${snippet.name}`}
                    target="_blank"
                    className="whitespace-nowrap mr-2 text-blue-500 hover:underline cursor-pointer flex-shrink-0"
                  >
                    {snippet.name}
                  </a>
                  <div className="text-xs text-gray-500 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                    {snippet.description}
                  </div>
                  <Button
                    size="sm"
                    className="ml-2 flex-shrink-0"
                    variant="outline"
                    onClick={() => {
                      onSnippetSelected(snippet)
                      onOpenChange(false)
                    }}
                  >
                    Import
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useImportSnippetDialog = createUseDialog(ImportSnippetDialog)

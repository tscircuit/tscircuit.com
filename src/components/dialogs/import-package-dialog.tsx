import { useAxios } from "@/hooks/useAxios"
import { useDebounce } from "@/hooks/use-debounce"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useState } from "react"
import { useQuery } from "react-query"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { createUseDialog } from "./create-use-dialog"

export const ImportPackageDialog = ({
  open,
  onOpenChange,
  onPackageSelected,
}: {
  open: boolean
  onOpenChange: (open: boolean) => any
  onPackageSelected: (pkg: Package) => any
}) => {
  const [searchText, setSearchText] = useState("")
  const debouncedSearch = useDebounce(searchText, 300)
  const axios = useAxios()
  const { data: snippets, isLoading } = useQuery(
    ["packageSearch", debouncedSearch],
    async () => {
      const response = await axios.post("/packages/search", {
        query: debouncedSearch,
      })
      return response.data.packages
    },
    {
      enabled: debouncedSearch.length > 0,
    },
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Import Package</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search packages..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full mb-4"
        />
        <div className="h-64 overflow-y-auto">
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <ul className="w-full">
              {snippets?.map((pkg: Package) => (
                <li
                  className="flex flex-col sm:flex-row items-start sm:items-center my-2 text-sm w-full"
                  key={pkg.package_id}
                >
                  <a
                    href={`/${pkg.name}`}
                    target="_blank"
                    className="text-blue-500 hover:underline cursor-pointer flex-shrink-0 mb-1 sm:mb-0 sm:mr-2"
                    rel="noreferrer"
                  >
                    {pkg.name}
                  </a>
                  <div className="text-gray-500 flex-grow overflow-hidden text-ellipsis whitespace-nowrap mb-1 sm:mb-0">
                    {pkg.description}
                  </div>
                  <Button
                    size="sm"
                    className="flex-shrink-0"
                    variant="outline"
                    onClick={() => {
                      onPackageSelected(pkg)
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

export const useImportPackageDialog = createUseDialog(ImportPackageDialog)

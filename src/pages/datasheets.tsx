import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useCreateDatasheet } from "@/hooks/use-create-datasheet"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { Link, useLocation } from "wouter"

interface DatasheetSummary {
  datasheet_id: string
  chip_name: string
}

export const DatasheetsPage: React.FC = () => {
  const axios = useAxios()
  const [, navigate] = useLocation()
  const createDatasheet = useCreateDatasheet({
    onSuccess: (datasheet) => navigate(`/datasheets/${datasheet.chip_name}`),
  })
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data: datasheets,
    isLoading,
    error,
  } = useQuery(
    ["datasheetList", searchQuery],
    async () => {
      const datasheets: DatasheetSummary[] = []
      let offset: number | null = 0
      do {
        const {
          data,
        }: {
          data: { datasheets: DatasheetSummary[]; next_offset?: number | null }
        } = await axios.get("/datasheets/list", {
          params: {
            ...(searchQuery ? { chip_name: searchQuery } : {}),
            limit: 500,
            offset,
          },
        })
        datasheets.push(...data.datasheets)
        offset = data.next_offset ?? null
      } while (offset !== null)
      return datasheets.sort((a, b) =>
        a.chip_name.localeCompare(b.chip_name, undefined, { numeric: true }),
      )
    },
    { keepPreviousData: true },
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 min-h-[80vh]">
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-4xl font-bold text-gray-900">Datasheets</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            Browse all indexed electronic components and chips, or search by
            name.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search datasheets..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search datasheets"
                role="searchbox"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 px-4">
            <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
              <Loader2 className="size-8 animate-spin text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              Loading Datasheets
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Please wait while we fetch the datasheets...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="mr-4 bg-red-100 p-2 rounded-full">
                <Search className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Error Loading Datasheets
                </h3>
                <p className="text-red-600">
                  We couldn't load the datasheets. Please try again later.
                </p>
              </div>
            </div>
          </div>
        ) : datasheets && datasheets.length > 0 ? (
          <section aria-label="Indexed datasheets">
            <p className="mb-3 text-sm text-gray-500" role="status">
              {datasheets.length.toLocaleString()}{" "}
              {searchQuery ? "matching" : "indexed"} datasheets
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-1 border-t border-gray-200 pt-3">
              {datasheets.map((ds) => (
                <li key={ds.datasheet_id} className="min-w-0">
                  <Link
                    href={`/datasheets/${encodeURIComponent(ds.chip_name)}`}
                    className="block rounded px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 break-words"
                  >
                    {ds.chip_name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              No Matching Datasheets
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              {searchQuery
                ? `No datasheets match your search for "${searchQuery}".`
                : "No datasheets have been indexed yet."}
            </p>
            {searchQuery && (
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() =>
                  createDatasheet.mutate({ chip_name: searchQuery })
                }
                disabled={createDatasheet.isLoading}
              >
                {createDatasheet.isLoading
                  ? "Creating..."
                  : `Create Datasheet for ${searchQuery}`}
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default DatasheetsPage

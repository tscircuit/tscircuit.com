import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useCreateDatasheet } from "@/hooks/use-create-datasheet"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Link, useLocation } from "wouter"

interface DatasheetSummary {
  datasheet_id: string
  chip_name: string
  chip_type?: string | null
  summary?: string | null
  description?: string | null
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
      const params = new URLSearchParams()
      if (searchQuery) {
        params.append("chip_name", searchQuery)
      } else {
        params.append("is_popular", "true")
      }
      const { data } = await axios.get(`/datasheets/list?${params.toString()}`)
      return data.datasheets as DatasheetSummary[]
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
            Explore datasheets for popular electronic components and chips.
            Search to find specific ones.
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
          <div className="text-center py-12 px-4">
            <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
              <Search className="w-8 h-8 text-slate-400" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasheets.map((ds) => (
              <Link
                key={ds.datasheet_id}
                href={`/datasheets/${ds.chip_name}`}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{ds.chip_name}</h3>
                  {ds.chip_type && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {ds.chip_type}
                    </span>
                  )}
                </div>
                {ds.summary && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {ds.summary}
                  </p>
                )}
                {ds.description && !ds.summary && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {ds.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
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
                : "There are no popular datasheets at the moment."}
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

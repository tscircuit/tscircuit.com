import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Link } from "wouter"

interface DatasheetSummary {
  datasheet_id: string
  chip_name: string
}

export const DatasheetsPage: React.FC = () => {
  const axios = useAxios()
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
      <main className="container mx-auto flex-1 px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Datasheets</h1>
        <div className="max-w-md mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error loading datasheets.</p>
        ) : datasheets && datasheets.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {datasheets.map((ds) => (
              <li key={ds.datasheet_id}>
                <Link href={`/datasheets/${ds.chip_name}`}>{ds.chip_name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No datasheets found.</p>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default DatasheetsPage

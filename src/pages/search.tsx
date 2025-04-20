import Header from "@/components/Header"
import Footer from "@/components/Footer"
import SearchComponent from "@/components/SearchComponent"
import { useState } from "react"
import { Search, Zap, Tag, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const SearchPage = () => {
  const [searchResults, setSearchResults] = useState<any[]>([])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-6 h-6 text-blue-500" />
                <h1 className="text-4xl font-bold text-gray-900">
                  Search Packages
                </h1>
              </div>
              <p className="text-lg text-gray-600 mb-4">
                Find circuit packages for your next project. Browse through our
                collection of community-created circuit designs, footprints, and
                components.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1">
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  <span>Search by Name</span>
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  <Tag className="w-3.5 h-3.5 mr-1" />
                  <span>Browse Packages</span>
                </Badge>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SearchComponent
                showFullResults
                onResultsFetched={(results) => setSearchResults(results)}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

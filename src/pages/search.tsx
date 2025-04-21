import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PageSearchComponent from "@/components/PageSearchComponent"
import { useState } from "react"
import { Search, Tag, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"

export const SearchPage = () => {
  const [searchResults, setSearchResults] = useState<any[]>([])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-8xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-6 h-6 text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Search tscircuit Packages
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
                <PrefetchPageLink href="/trending">
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer hover:bg-gray-200"
                  >
                    <Tag className="w-3.5 h-3.5 mr-1" />
                    <span>Browse Packages</span>
                  </Badge>
                </PrefetchPageLink>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <PageSearchComponent
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

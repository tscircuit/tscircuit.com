import { DatasheetBreadcrumbs } from "@/components/DatasheetBreadcrumbs"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { ReferenceDesignPreview } from "@/components/ReferenceDesignPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDatasheetReferenceDesignPackages } from "@/hooks/use-datasheet-reference-design-packages"
import { useReferenceDesignSelection } from "@/hooks/use-reference-design-selection"
import {
  getReferenceDesignsUrl,
  updateReferenceDesignSelection,
} from "@/lib/reference-design-selection"
import { Link, useParams } from "wouter"

export default function DatasheetReferenceDesignPage() {
  const { chipName, author, packageName } = useParams<{
    chipName: string
    author: string
    packageName: string
  }>()
  const name = `${author}/${packageName}`
  const { packages, failed, isLoading, refetch } =
    useDatasheetReferenceDesignPackages(chipName)
  const selection = useReferenceDesignSelection()
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full flex-grow px-4 py-8 md:px-20 lg:px-28">
        <DatasheetBreadcrumbs
          chipName={chipName}
          referenceDesigns
          referenceDesignName={packageName}
        />
        <div className="mb-8">
          <h1 className="mb-2 break-words text-3xl font-bold text-gray-900 md:text-4xl">
            {packageName}
          </h1>
          <Link
            href={`/${encodeURIComponent(author)}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {author}
          </Link>
        </div>
        <Card
          role="region"
          aria-labelledby="reference-design-heading"
          className="min-w-0"
        >
          <CardHeader>
            <CardTitle id="reference-design-heading" className="text-xl">
              Reference design
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p role="status" className="py-8">
                Loading reference design...
              </p>
            ) : packages.includes(name) ? (
              <ReferenceDesignPreview
                key={name}
                name={name}
                selection={selection}
                onSelectionChange={updateReferenceDesignSelection}
              />
            ) : failed.length ? (
              <div role="alert">
                <p>Unable to load the reference design.</p>
                <Button
                  className="mt-3"
                  variant="outline"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div>
                <p className="mb-4">
                  This reference design is not available for {chipName}.
                </p>
                <Button variant="outline" asChild>
                  <Link href={getReferenceDesignsUrl(chipName)}>
                    Reference designs
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

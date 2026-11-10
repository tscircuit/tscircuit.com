import { DatasheetBreadcrumbs } from "@/components/DatasheetBreadcrumbs"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useDatasheetReferenceDesignPackages } from "@/hooks/use-datasheet-reference-design-packages"
import { getReferenceDesignUrl } from "@/lib/reference-design-selection"
import { ArrowRight } from "lucide-react"
import { Suspense, lazy } from "react"
import { Link, useParams } from "wouter"

const DatasheetReferenceDesign = lazy(
  () => import("@/pages/datasheet-reference-design"),
)

function ReferenceDesignLoading() {
  return (
    <div
      className="flex h-[620px] items-center justify-center text-sm text-gray-500"
      role="status"
    >
      Loading reference design...
    </div>
  )
}

export default function DatasheetReferenceDesignsPage() {
  const { chipName, author, packageName } = useParams<{
    chipName: string
    author?: string
    packageName?: string
  }>()
  const name = author && packageName ? `${author}/${packageName}` : undefined
  const { packages, failed, isLoading, refetch } =
    useDatasheetReferenceDesignPackages(chipName)
  return (
    <div className="flex min-h-screen flex-col" data-reference-design-page>
      <Header />
      <main className="mx-auto w-full flex-grow px-4 py-8 md:px-20 lg:px-28">
        <DatasheetBreadcrumbs
          chipName={chipName}
          referenceDesigns
          referenceDesignName={name ? packageName : undefined}
        />
        <h1
          id="reference-design-heading"
          className="mb-8 break-words text-3xl font-bold text-gray-900 md:text-4xl"
        >
          {chipName} Reference Designs
        </h1>
        <Card
          role="region"
          aria-labelledby="reference-design-heading"
          className="min-w-0"
        >
          <CardContent className="pt-6">
            {name ? (
              <>
                <div className="mb-4 px-2 py-4">
                  <p className="break-words font-semibold">{packageName}</p>
                  <Link
                    href={`/${encodeURIComponent(author!)}`}
                    className="text-sm text-gray-500 hover:text-blue-600 hover:underline"
                  >
                    {author}
                  </Link>
                </div>
                {isLoading ? (
                  <ReferenceDesignLoading />
                ) : packages.includes(name) ? (
                  <Suspense fallback={<ReferenceDesignLoading />}>
                    <DatasheetReferenceDesign key={name} name={name} />
                  </Suspense>
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
                  <p>This reference design is not available for {chipName}.</p>
                )}
              </>
            ) : isLoading ? (
              <p role="status">Loading reference designs...</p>
            ) : failed.length > 0 && !packages.length ? (
              <div role="alert">
                <p>Unable to load reference designs.</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : !packages.length ? (
              <p className="text-sm text-gray-500">
                No reference designs available.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {packages.map((name) => (
                  <li key={name}>
                    <Link
                      href={getReferenceDesignUrl({ chipName, name })}
                      className="flex items-center justify-between gap-4 rounded-md px-2 py-4 hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block break-words font-semibold text-blue-600">
                          {name.split("/")[1]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {name.split("/")[0]}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

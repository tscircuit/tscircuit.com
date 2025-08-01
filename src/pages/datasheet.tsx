import { useParams } from "wouter"
import { useDatasheet } from "@/hooks/use-datasheet"
import { useCreateDatasheet } from "@/hooks/use-create-datasheet"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ExpandableText from "@/components/ExpandableText"
import type { Datasheet } from "fake-snippets-api/lib/db/schema"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, FileText } from "lucide-react"

const SectionCard = ({
  title,
  children,
}: { title: string; children: React.ReactNode }) => (
  <Card className="mb-6">
    <CardHeader className="pb-2">
      <CardTitle className="text-xl font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

export const DatasheetPage = () => {
  const { chipName } = useParams<{ chipName: string }>()
  const datasheetQuery = useDatasheet(chipName)
  const createDatasheet = useCreateDatasheet()

  const handleCreate = () => {
    if (!chipName) return
    createDatasheet.mutate({ chip_name: chipName })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow  mx-auto px-4 md:px-20 lg:px-28 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 break-words">
            {chipName} Datasheet
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            View and download the datasheet for{" "}
            <span className="font-semibold text-gray-800">{chipName}</span>. If
            the datasheet is not available, you can request its creation.
          </p>
          <a
            href={`https://api.tscircuit.com/datasheets/get?chip_name=${encodeURIComponent(chipName)}`}
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="w-4 h-4" /> Download JSON
          </a>
        </div>

        {datasheetQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Datasheet...</h3>
            <p className="text-gray-500 max-w-md text-center">
              Please wait while we fetch the datasheet information for{" "}
              <span className="font-semibold">{chipName}</span>.
            </p>
          </div>
        ) : datasheetQuery.data ? (
          <>
            {!(
              datasheetQuery.data.pin_information ||
              datasheetQuery.data.datasheet_pdf_urls ||
              datasheetQuery.data.description
            ) && (
              <SectionCard title="Processing">
                <div className="flex items-center gap-3 text-yellow-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Datasheet is processing. Please check back later.</span>
                </div>
              </SectionCard>
            )}

            {datasheetQuery.data.chip_type && (
              <SectionCard title="Chip Type">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    {datasheetQuery.data.chip_type}
                  </span>
                </div>
              </SectionCard>
            )}

            <SectionCard title="Summary">
              {datasheetQuery.data.summary ? (
                <p className="text-gray-700">{datasheetQuery.data.summary}</p>
              ) : (
                <p className="text-gray-500">No summary available.</p>
              )}
            </SectionCard>

            <SectionCard title="Description">
              {datasheetQuery.data.description ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <span>{datasheetQuery.data.description}</span>
                </div>
              ) : (
                <p className="text-gray-500">No description available.</p>
              )}
            </SectionCard>

            <SectionCard title="PDFs">
              {datasheetQuery.data.datasheet_pdf_urls &&
              datasheetQuery.data.datasheet_pdf_urls.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {datasheetQuery.data.datasheet_pdf_urls.map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        className="text-blue-600 underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No datasheet PDFs available.</p>
              )}
            </SectionCard>

            {datasheetQuery.data.footprint_information && (
              <SectionCard title="Footprint Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Package Details</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Package Type:</dt>
                        <dd className="font-medium">{datasheetQuery.data.footprint_information.package_type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Pin Count:</dt>
                        <dd className="font-medium">{datasheetQuery.data.footprint_information.pin_count}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Pin Spacing:</dt>
                        <dd className="font-medium">{datasheetQuery.data.footprint_information.pin_spacing_mm}mm</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Material:</dt>
                        <dd className="font-medium">{datasheetQuery.data.footprint_information.package_material}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Mounting:</dt>
                        <dd className="font-medium">{datasheetQuery.data.footprint_information.mounting_type}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Dimensions</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Length:</dt>
                        <dd className="font-medium">{datasheetQuery.data.footprint_information.dimensions.length_mm}mm</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Width:</dt>
                        <dd className="font-medium">{datasheetQuery.data.footprint_information.dimensions.width_mm}mm</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Height:</dt>
                        <dd className="font-medium">{datasheetQuery.data.footprint_information.dimensions.height_mm}mm</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </SectionCard>
            )}

            {datasheetQuery.data.metadata && (
              <SectionCard title="Metadata">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(datasheetQuery.data.metadata as Record<string, any>).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-600 capitalize">{key.replace(/_/g, " ")}:</dt>
                        <dd className="font-medium">{String(value)}</dd>
                      </div>
                    )
                  ))}
                </div>
              </SectionCard>
            )}

            <SectionCard title="Pin Information">
              {datasheetQuery.data.pin_information &&
              datasheetQuery.data.pin_information.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="border-b px-3 py-2 text-left font-semibold">
                          Pin
                        </th>
                        <th className="border-b px-3 py-2 text-left font-semibold">
                          Name
                        </th>
                        <th className="border-b px-3 py-2 text-left font-semibold">
                          Description
                        </th>
                        <th className="border-b px-3 py-2 text-left font-semibold">
                          Capabilities
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {datasheetQuery.data.pin_information.map((pin: any) => (
                        <tr key={pin.pin_number} className="hover:bg-gray-50">
                          <td className="border-b px-3 py-2 font-mono">
                            {pin.pin_number}
                          </td>
                          <td className="border-b px-3 py-2">
                            {Array.isArray(pin.name) ? pin.name.join(", ") : pin.name}
                          </td>
                          <td className="border-b px-3 py-2">
                            {pin.description}
                          </td>
                          <td className="border-b px-3 py-2">
                            <ExpandableText
                              text={pin.capabilities.join(", ")}
                              maxChars={30}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No pin information available.</p>
              )}
            </SectionCard>
          </>
        ) : datasheetQuery.error &&
          (datasheetQuery.error as any).status === 404 ? (
          <SectionCard title="No Datasheet Found">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-gray-700 text-center">
                No datasheet found for{" "}
                <span className="font-semibold">{chipName}</span>.<br />
                You can request its creation below.
              </p>
              <Button
                className="mt-2"
                onClick={handleCreate}
                disabled={createDatasheet.isLoading}
                size="lg"
              >
                {createDatasheet.isLoading ? "Creating..." : "Create Datasheet"}
              </Button>
            </div>
          </SectionCard>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Error loading datasheet
            </h3>
            <p className="text-gray-500 max-w-md text-center">
              There was an error loading the datasheet for{" "}
              <span className="font-semibold">{chipName}</span>. Please try
              again later.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default DatasheetPage

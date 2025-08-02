import { useParams } from "wouter"
import { useDatasheet } from "@/hooks/use-datasheet"
import { useCreateDatasheet } from "@/hooks/use-create-datasheet"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ExpandableText from "@/components/ExpandableText"
import type { Datasheet, DatasheetVariant } from "fake-snippets-api/lib/db/schema"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, FileText, Package } from "lucide-react"
import { useState } from "react"

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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const handleCreate = () => {
    if (!chipName) return
    createDatasheet.mutate({ chip_name: chipName })
  }

  // Get the current variant (either selected or default)
  const currentVariant = datasheetQuery.data?.variant

  // Get pin information from the current variant
  const pinInformation = currentVariant?.pin_information || null

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
              pinInformation ||
              datasheetQuery.data.datasheet_pdf_urls
            ) && (
              <SectionCard title="Processing">
                <div className="flex items-center gap-3 text-yellow-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Datasheet is processing. Please check back later.</span>
                </div>
              </SectionCard>
            )}

            <SectionCard title="Description">
              {datasheetQuery.data.ai_description ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <span>{datasheetQuery.data.ai_description}</span>
                </div>
              ) : (
                <p className="text-gray-500">No description available.</p>
              )}
            </SectionCard>

            {datasheetQuery.data.available_variants && datasheetQuery.data.available_variants.length > 1 && (
              <SectionCard title="Package Variants">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Select a package variant to view its pin information:
                    </p>
                    <Select
                      value={currentVariant?.datasheet_variant_id || ""}
                      onValueChange={(value) => {
                        // For now, we'll need to refetch the datasheet with the selected variant
                        // This would require updating the API to accept a variant_id parameter
                        console.log("Selected variant:", value)
                      }}
                    >
                      <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Select a variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasheetQuery.data.available_variants.map((variant) => (
                          <SelectItem key={variant.datasheet_variant_id} value={variant.datasheet_variant_id}>
                            {variant.variant_name}
                            {variant.package_type && ` (${variant.package_type})`}
                            {variant.is_default_variant && " (Default)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SectionCard>
            )}

            {currentVariant && (
              <SectionCard title="Package Information">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Variant:</span> {currentVariant.variant_name}
                  </div>
                  {currentVariant.package_type && (
                    <div>
                      <span className="font-medium">Package Type:</span> {currentVariant.package_type}
                    </div>
                  )}
                  {currentVariant.package_description && (
                    <div>
                      <span className="font-medium">Description:</span> {currentVariant.package_description}
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

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

            <SectionCard title="Pin Information">
              {pinInformation &&
              pinInformation.length > 0 ? (
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
                      {pinInformation.map((pin: any) => (
                        <tr key={pin.pin_number} className="hover:bg-gray-50">
                          <td className="border-b px-3 py-2 font-mono">
                            {pin.pin_number}
                          </td>
                          <td className="border-b px-3 py-2">{pin.name}</td>
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

import ReactMarkdown from "react-markdown"
import { useParams } from "wouter"
import { useDatasheet } from "@/hooks/use-datasheet"
import { useCreateDatasheet } from "@/hooks/use-create-datasheet"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { DatasheetPinTable } from "@/components/DatasheetPinTable"
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
            Pin functions, electrical requirements, and manufacturer documents.
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
          <div className="flex flex-col items-center justify-center py-20">
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
              datasheetQuery.data.datasheet_pdf_urls
            ) && (
              <SectionCard title="Processing">
                <div className="flex items-center gap-3 text-yellow-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Datasheet is processing. Please check back later.</span>
                </div>
              </SectionCard>
            )}

            <div className="grid gap-x-6 lg:grid-cols-[2fr_1fr]">
              <SectionCard title="Overview">
                {datasheetQuery.data.ai_description ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {datasheetQuery.data.ai_description}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No description available.</p>
                )}
              </SectionCard>

              <SectionCard title="Source documents">
                {datasheetQuery.data.datasheet_pdf_urls &&
                datasheetQuery.data.datasheet_pdf_urls.length > 0 ? (
                  <ul className="space-y-2">
                    {datasheetQuery.data.datasheet_pdf_urls.map(
                      (url, index) => (
                        <li key={url}>
                          <a
                            href={url}
                            className="inline-flex items-center gap-2 text-blue-600 hover:underline break-all"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            Datasheet PDF
                            {(datasheetQuery.data.datasheet_pdf_urls?.length ??
                              0) > 1
                              ? ` ${index + 1}`
                              : ""}
                          </a>
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500">No datasheet PDFs available.</p>
                )}
              </SectionCard>
            </div>
            <SectionCard title="Pin Information">
              {datasheetQuery.data.pin_information &&
              datasheetQuery.data.pin_information.length > 0 ? (
                <DatasheetPinTable
                  key={chipName}
                  pins={datasheetQuery.data.pin_information}
                  pinAttributes={datasheetQuery.data.pin_attributes}
                />
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

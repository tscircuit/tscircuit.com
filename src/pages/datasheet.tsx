import { useParams } from "wouter"
import { useDatasheet } from "@/hooks/use-datasheet"
import { useCreateDatasheet } from "@/hooks/use-create-datasheet"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ExpandableText from "@/components/ExpandableText"
import type { Datasheet } from "fake-snippets-api/lib/db/schema"

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
      <main className="container mx-auto flex-1 px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{chipName} Datasheet</h1>
        <p className="mb-4">
          <a
            href={`https://api.tscircuit.com/datasheets/get?chip_name=${encodeURIComponent(chipName)}`}
            className="text-blue-600 underline"
          >
            Download JSON
          </a>
        </p>
        {datasheetQuery.isLoading ? (
          <p>Loading...</p>
        ) : datasheetQuery.data ? (
          <div>
            {!datasheetQuery.data.pin_information &&
              !datasheetQuery.data.datasheet_pdf_urls && (
                <p>Datasheet is processing. Please check back later.</p>
              )}

            <h2 className="text-xl font-semibold mb-2">PDFs</h2>
            {datasheetQuery.data.datasheet_pdf_urls ? (
              <ul className="list-disc pl-5 mb-6">
                {datasheetQuery.data.datasheet_pdf_urls.map((url) => (
                  <li key={url}>
                    <a href={url} className="text-blue-600 underline">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No datasheet PDFs available.</p>
            )}

            <h2 className="text-xl font-semibold mb-2">Pin Information</h2>
            {datasheetQuery.data.pin_information ? (
              <table className="table-auto border-collapse mb-6">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Pin</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Description</th>
                    <th className="border px-2 py-1">Capabilities</th>
                  </tr>
                </thead>
                <tbody>
                  {datasheetQuery.data.pin_information.map((pin) => (
                    <tr key={pin.pin_number}>
                      <td className="border px-2 py-1">{pin.pin_number}</td>
                      <td className="border px-2 py-1">{pin.name}</td>
                      <td className="border px-2 py-1">{pin.description}</td>
                      <td className="border px-2 py-1">
                        <ExpandableText
                          text={pin.capabilities.join(", ")}
                          maxChars={30}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No pin information available.</p>
            )}
          </div>
        ) : datasheetQuery.error &&
          (datasheetQuery.error as any).status === 404 ? (
          <div>
            <p>No datasheet found.</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleCreate}
              disabled={createDatasheet.isLoading}
            >
              {createDatasheet.isLoading ? "Creating..." : "Create Datasheet"}
            </button>
          </div>
        ) : (
          <p>Error loading datasheet.</p>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default DatasheetPage

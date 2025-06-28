import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useParams } from "wouter"
import { useDatasheet } from "@/hooks/use-datasheet"

export const DatasheetPage = () => {
  const { chipName } = useParams()
  const { data: datasheet, error, isLoading } = useDatasheet(chipName)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading && <p>Loading…</p>}
        {error && <p>Failed to load datasheet.</p>}
        {datasheet && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{datasheet.chip_name}</h1>
            {datasheet.datasheet_pdf_urls && (
              <div>
                <h2 className="text-xl font-semibold mb-2">PDFs</h2>
                <ul className="list-disc list-inside space-y-1">
                  {datasheet.datasheet_pdf_urls.map((url, i) => (
                    <li key={i}>
                      <a className="text-blue-600 hover:underline" href={url}>
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {datasheet.pin_information && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Pins</h2>
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 text-left">#</th>
                      <th className="border px-2 py-1 text-left">Name</th>
                      <th className="border px-2 py-1 text-left">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasheet.pin_information.map((pin, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{pin.pin_number}</td>
                        <td className="border px-2 py-1">{pin.name}</td>
                        <td className="border px-2 py-1">{pin.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default DatasheetPage

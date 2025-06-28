import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { navigate } from "wouter/use-browser-location"

export const DatasheetsPage = () => {
  const [chip, setChip] = useState("")

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Datasheets</h1>
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Chip name"
            value={chip}
            onChange={(e) => setChip(e.target.value)}
          />
          <Button
            onClick={() => {
              if (chip.trim()) {
                navigate(`/datasheets/${encodeURIComponent(chip.trim())}`)
              }
            }}
          >
            View
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default DatasheetsPage

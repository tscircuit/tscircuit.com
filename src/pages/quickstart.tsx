import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Package, Snippet } from "fake-snippets-api/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TypeBadge } from "@/components/TypeBadge"
import { JLCPCBImportDialog } from "@/components/JLCPCBImportDialog"
import { CircuitJsonImportDialog } from "@/components/CircuitJsonImportDialog"
import { useNotImplementedToast } from "@/hooks/use-toast"
import { useGlobalStore } from "@/hooks/use-global-store"
import { cn } from "@/lib/utils"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"

export const QuickstartPage = () => {
  const axios = useAxios()
  const [isJLCPCBDialogOpen, setIsJLCPCBDialogOpen] = useState(false)
  const [isCircuitJsonImportDialogOpen, setIsCircuitJsonImportDialogOpen] =
    useState(false)
  const toastNotImplemented = useNotImplementedToast()
  const currentUser = useGlobalStore((s) => s.session?.github_username)
  const { data: myPackages, isLoading } = useQuery<Package[]>(
    "userPackages",
    async () => {
      const response = await axios.post(`/packages/list`, {
        owner_github_username: currentUser,
      })
      return response.data.packages
    },
  )

  const blankTemplates = [
    { name: "Blank Circuit Board", type: "board" },
    { name: "Blank Circuit Module", type: "package" },
    { name: "Blank 3D Model", type: "model", disabled: true },
    { name: "Blank Footprint", type: "footprint", disabled: true },
  ]

  const templates = [
    { name: "Blinking LED Board", type: "board" },
    { name: "USB-C LED Flashlight", type: "board" },
  ]

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 hidden md:block">
          <h2 className="text-xl font-semibold mb-4">Recent Snippets</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {myPackages
                ?.sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )
                .slice(0, 4)
                .map((pkg) => (
                  <PrefetchPageLink
                    key={pkg.package_id}
                    href={`/editor?snippet_id=${pkg.package_id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow rounded-md flex flex-col h-full">
                      <CardHeader className="pb-0 p-4">
                        <CardTitle className="text-md">
                          {pkg.unscoped_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 mt-auto">
                        <p className="text-sm text-gray-500">
                          Last edited:{" "}
                          {new Date(pkg.updated_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </PrefetchPageLink>
                ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Start Blank Snippet</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {blankTemplates.map((template, index) => (
              <PrefetchPageLink
                key={index}
                href={
                  template.disabled
                    ? "#"
                    : `/editor?template=${template.name
                        .toLowerCase()
                        .replace(/ /g, "-")}`
                }
              >
                <Card
                  className={cn(
                    "hover:shadow-md transition-shadow rounded-md h-full flex flex-col",
                    template.disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <CardHeader className="p-4 flex-grow flex flex-col justify-between">
                    <CardTitle className="text-md">{template.name}</CardTitle>
                    <div className="mt-2 flex">
                      <TypeBadge type={template.type as any} />
                    </div>
                  </CardHeader>
                </Card>
              </PrefetchPageLink>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Import as Snippet</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "KiCad Footprint", type: "footprint" },
              { name: "KiCad Project", type: "board" },
              { name: "KiCad Module", type: "package" },
            ].map((template, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow rounded-md opacity-50 flex flex-col"
              >
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {template.name}
                    <TypeBadge type={template.type as any} className="ml-2" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 mt-auto">
                  <Button
                    className="w-full"
                    onClick={() => {
                      toastNotImplemented("Kicad Imports")
                    }}
                  >
                    Import {template.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Card className="hover:shadow-md transition-shadow rounded-md flex flex-col">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg flex items-center justify-between">
                  JLCPCB Component
                  <TypeBadge type="package" className="ml-2" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 mt-auto">
                <Button
                  className="w-full"
                  onClick={() => setIsJLCPCBDialogOpen(true)}
                >
                  Import JLCPCB Component
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow rounded-md flex flex-col">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg flex items-center justify-between">
                  Circuit Json
                  <TypeBadge type="module" className="ml-2" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 mt-auto">
                <Button
                  className="w-full"
                  onClick={() => setIsCircuitJsonImportDialogOpen(true)}
                >
                  Import Circuit JSON
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <JLCPCBImportDialog
          open={isJLCPCBDialogOpen}
          onOpenChange={setIsJLCPCBDialogOpen}
        />

        <CircuitJsonImportDialog
          open={isCircuitJsonImportDialogOpen}
          onOpenChange={setIsCircuitJsonImportDialogOpen}
        />

        <div>
          <h2 className="text-xl font-semibold mb-4 mt-12">
            Start from a Template
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {templates.map((template, index) => (
              <PrefetchPageLink
                key={index}
                href={`/editor?template=${template.name
                  .toLowerCase()
                  .replace(/ /g, "-")}`}
              >
                <Card className="hover:shadow-md transition-shadow rounded-md">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {template.name}
                      <TypeBadge type={template.type as any} className="ml-2" />
                    </CardTitle>
                  </CardHeader>
                </Card>
              </PrefetchPageLink>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

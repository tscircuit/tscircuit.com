import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TypeBadge } from "@/components/TypeBadge"
import { JLCPCBImportDialog } from "@/components/JLCPCBImportDialog"
import { useNotImplementedToast } from "@/hooks/use-toast"
import { useGlobalStore } from "@/hooks/use-global-store"
import { cn } from "@/lib/utils"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"

export const QuickstartPage = () => {
  const axios = useAxios()
  const [isJLCPCBDialogOpen, setIsJLCPCBDialogOpen] = useState(false)
  const toastNotImplemented = useNotImplementedToast()
  const currentUser = useGlobalStore((s) => s.session?.github_username)
  const { data: mySnippets, isLoading } = useQuery<Snippet[]>(
    "userSnippets",
    async () => {
      const response = await axios.get(
        `/snippets/list?owner_name=${currentUser}`,
      )
      return response.data.snippets
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
    <div className="dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <div className="container px-4 py-8 mx-auto">
        <div className="hidden mb-8 md:block">
          <h2 className="mb-4 text-xl font-semibold">Recent Snippets</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {mySnippets
                ?.sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )
                .slice(0, 4)
                .map((snippet) => (
                  <PrefetchPageLink
                    key={snippet.snippet_id}
                    href={`/editor?snippet_id=${snippet.snippet_id}`}
                  >
                    <Card className="transition-shadow rounded-md hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-md dark:text-gray-100">
                          {snippet.unscoped_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last edited:{" "}
                          {new Date(snippet.updated_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </PrefetchPageLink>
                ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Start Blank Snippet</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                    "hover:shadow-md transition-shadow rounded-md h-full flex flex-col dark:bg-gray-800 dark:border-gray-700",
                    template.disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <CardHeader className="flex flex-col justify-between flex-grow p-4">
                    <CardTitle className="text-md dark:text-gray-100">
                      {template.name}
                    </CardTitle>
                    <div className="flex mt-2">
                      <TypeBadge type={template.type as any} />
                    </div>
                  </CardHeader>
                </Card>
              </PrefetchPageLink>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Import as Snippet</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { name: "KiCad Footprint", type: "footprint" },
              { name: "KiCad Project", type: "board" },
              { name: "KiCad Module", type: "package" },
            ].map((template, index) => (
              <Card
                key={index}
                className="transition-shadow rounded-md opacity-50 hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
              >
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="flex items-center justify-between text-lg dark:text-gray-100">
                    {template.name}
                    <TypeBadge type={template.type as any} className="ml-2" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
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
            <Card className="transition-shadow rounded-md hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="flex items-center justify-between text-lg dark:text-gray-100">
                  JLCPCB Component
                  <TypeBadge type="package" className="ml-2" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Button
                  className="w-full"
                  onClick={() => setIsJLCPCBDialogOpen(true)}
                >
                  Import JLCPCB Component
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <JLCPCBImportDialog
          open={isJLCPCBDialogOpen}
          onOpenChange={setIsJLCPCBDialogOpen}
        />

        <div>
          <h2 className="mt-12 mb-4 text-xl font-semibold">
            Start from a Template
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {templates.map((template, index) => (
              <PrefetchPageLink
                key={index}
                href={`/editor?template=${template.name
                  .toLowerCase()
                  .replace(/ /g, "-")}`}
              >
                <Card className="transition-shadow rounded-md hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center justify-between text-lg dark:text-gray-100">
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

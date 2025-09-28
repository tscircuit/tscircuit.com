import React, { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Package } from "fake-snippets-api/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TypeBadge } from "@/components/TypeBadge"
import { JLCPCBImportDialog } from "@/components/JLCPCBImportDialog"
import { CircuitJsonImportDialog } from "@/components/CircuitJsonImportDialog"
import { useNotImplementedToast } from "@/hooks/use-toast"
import { useGlobalStore } from "@/hooks/use-global-store"
import { cn } from "@/lib/utils"
import { Link } from "wouter"
import { Loader2 } from "lucide-react"

export const QuickstartPage = () => {
  const axios = useAxios()
  const queryClient = useQueryClient()
  const [isJLCPCBDialogOpen, setIsJLCPCBDialogOpen] = useState(false)
  const [isCircuitJsonImportDialogOpen, setIsCircuitJsonImportDialogOpen] =
    useState(false)
  const toastNotImplemented = useNotImplementedToast()
  const currentUser = useGlobalStore((s) => s.session?.github_username)
  const isLoggedIn = Boolean(currentUser)
  useEffect(() => {
    queryClient.removeQueries("userPackages")
  }, [queryClient])
  const { data: myPackages, isLoading } = useQuery<Package[]>(
    ["userPackages", currentUser],
    async () => {
      const response = await axios.post(`/packages/list`, {
        owner_github_username: currentUser,
      })
      return response.data.packages
    },
    {
      enabled: isLoggedIn,
    },
  )

  const blankTemplates: Array<{
    name: string
    type: string
    disabled?: boolean
  }> = [
    { name: "Blank Circuit Board", type: "board" },
    { name: "Blank Circuit Module", type: "package" },
  ]

  const templates = [
    { name: "Blinking LED Board", type: "board" },
    { name: "USB-C LED Flashlight", type: "board" },
  ]

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6 py-12">
        {isLoggedIn && (
          <div className="mb-16 hidden md:block">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                Recent Packages
              </h2>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {myPackages
                  ?.sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime(),
                  )
                  .slice(0, 4)
                  .map((pkg) => (
                    <Link
                      key={pkg.package_id}
                      href={`/editor?package_id=${pkg.package_id}`}
                    >
                      <Card className="hover:shadow-md border bg-white shadow-sm transition-shadow flex flex-col h-full rounded-md">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-slate-900">
                            {pkg.unscoped_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="-mt-4">
                          <p className="text-sm text-slate-500">
                            Last edited{" "}
                            {new Date(pkg.updated_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              Start Blank
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blankTemplates.map((template, index) => (
              <Link
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
                    "hover:shadow-md border bg-white transition-shadow h-full flex flex-col rounded-md",
                    template.disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <CardHeader className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900 mb-3">
                        {template.name}
                      </CardTitle>
                      <div className="flex justify-between items-center">
                        <TypeBadge type={template.type as any} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              Import Components
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md border bg-white transition-shadow flex flex-col rounded-md">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    JLCPCB Component
                  </CardTitle>
                  <TypeBadge type="package" />
                </div>
                <p className="text-sm text-slate-500">
                  Import components from JLCPCB library
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 mt-auto">
                <Button
                  className="w-full text-white"
                  onClick={() => setIsJLCPCBDialogOpen(true)}
                >
                  Import JLCPCB
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md border bg-white transition-shadow flex flex-col rounded-md">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Circuit JSON
                  </CardTitle>
                  <TypeBadge type="package" />
                </div>
                <p className="text-sm text-slate-500">
                  Import from Circuit JSON format
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 mt-auto">
                <Button
                  className="w-full text-white"
                  onClick={() => setIsCircuitJsonImportDialogOpen(true)}
                >
                  Import JSON
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

        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              Popular Templates
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <Link
                key={index}
                href={`/editor?template=${template.name
                  .toLowerCase()
                  .replace(/ /g, "-")}`}
              >
                <Card className="hover:shadow-md border bg-white transition-shadow rounded-md">
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between ">
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        {template.name}
                      </CardTitle>
                      <TypeBadge type={template.type as any} />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

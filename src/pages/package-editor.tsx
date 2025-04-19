import { CodeAndPreview } from "@/components/package-port/CodeAndPreview"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { usePackage } from "@/hooks/use-package"
import { Helmet } from "react-helmet-async"
import { useCurrentPackageId } from "@/hooks/use-current-package-id"
import { NotFound } from "@/components/NotFound"
import { AlertCircleIcon } from "lucide-react"
import { ErrorOutline } from "@/components/ErrorOutline"

export const EditorPage = () => {
  const { packageId } = useCurrentPackageId()
  const { data: pkg, isLoading, error } = usePackage(packageId)
  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <title>{pkg ? `${pkg.name} - tscircuit` : "tscircuit editor"}</title>
        {pkg && (
          <>
            <meta
              property="og:title"
              content={`${pkg.unscoped_name} - tscircuit`}
            />
            <meta
              property="og:image"
              content={`https://registry-api.tscircuit.com/snippets/images/${pkg.owner_github_username}/${pkg.unscoped_name}/pcb.png`}
            />
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              name="twitter:image"
              content={`https://registry-api.tscircuit.com/snippets/images/${pkg.owner_github_username}/${pkg.unscoped_name}/pcb.png`}
            />
          </>
        )}
      </Helmet>
      <Header />
      {!error && <CodeAndPreview pkg={pkg} />}
      {error && error.status === 404 && (
        <NotFound heading="Package not found" />
      )}
      {error && error.status !== 404 && (
        <div className="min-h-screen grid place-items-center">
          <ErrorOutline
            error={error}
            description={"There was an error loading the editor page"}
          />
        </div>
      )}
      <Footer />
    </div>
  )
}

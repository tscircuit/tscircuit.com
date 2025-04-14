import { CodePreview } from "@/components/p/CodeAndPreview"
import { CodeAndPreview } from "@/components/CodeAndPreview"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useCurrentSnippetId } from "@/hooks/use-current-snippet-id"
import { usePackage } from "@/hooks/use-package"
import { useSnippet } from "@/hooks/use-snippet"
import { Helmet } from "react-helmet-async"

export const EditorPage = () => {
  const { snippetId: packageId } = useCurrentSnippetId()
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
      {!error && <CodePreview pkg={pkg} />}
      {error && error.status === 404 && (
        <div className="w-full h-[calc(100vh-20rem)] text-xl text-center flex justify-center items-center">
          Package not found
        </div>
      )}
      {error && error.status !== 404 && (
        <div className="flex flex-col">
          Something strange happened<div>{error.message}</div>
        </div>
      )}
      <Footer />
    </div>
  )
}

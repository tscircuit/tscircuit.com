import { CodeAndPreview } from "@/components/package-port/CodeAndPreview"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { Helmet } from "react-helmet-async"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"

export const EditorPage = () => {
  const { packageInfo: pkg, error } = useCurrentPackageInfo()

  const projectUrl = pkg ? `https://tscircuit.com/${pkg.name}` : undefined
  const previewImageUrl =
    pkg?.latest_pcb_preview_image_url ??
    pkg?.latest_sch_preview_image_url ??
    pkg?.latest_cad_preview_image_url ??
    undefined

  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <title>
          {pkg ? `${pkg.unscoped_name} - tscircuit` : "tscircuit editor"}
        </title>
        {pkg && (
          <>
            <meta
              property="og:title"
              content={`${pkg.unscoped_name} - tscircuit`}
            />
            {previewImageUrl && (
              <>
                <meta property="og:image" content={previewImageUrl} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content={previewImageUrl} />
              </>
            )}
          </>
        )}
      </Helmet>
      <Header />
      {!error && <CodeAndPreview pkg={pkg} projectUrl={projectUrl} />}
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

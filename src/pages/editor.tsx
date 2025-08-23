import { CodeAndPreview } from "@/components/package-port/CodeAndPreview"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { Helmet } from "react-helmet-async"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"

export const EditorPage = () => {
  const { packageInfo: pkg, error } = useCurrentPackageInfo()

  const projectUrl = pkg
    ? `https://tscircuit.com/${pkg.owner_github_username}/${pkg.unscoped_name}`
    : undefined

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
            <meta
              property="og:image"
              content={`https://api.tscircuit.com/packages/images/${pkg.owner_github_username}/${pkg.unscoped_name}/pcb.png?fs_sha=${pkg.latest_package_release_fs_sha}`}
            />
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              name="twitter:image"
              content={`https://api.tscircuit.com/packages/images/${pkg.owner_github_username}/${pkg.unscoped_name}/pcb.png?fs_sha=${pkg.latest_package_release_fs_sha}`}
            />
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

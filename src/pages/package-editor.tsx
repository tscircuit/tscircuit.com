import { CodeAndPreview } from "@/components/package-port/CodeAndPreview"
import Header from "@/components/Header"
import { Helmet } from "react-helmet-async"
import { NotFound } from "@/components/NotFound"
import { ErrorOutline } from "@/components/ErrorOutline"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"

export const EditorPage = () => {
  const { packageInfo: pkg, error } = useCurrentPackageInfo()

  const uuid4RegExp = new RegExp(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
  )

  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
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
      <div className="flex-1 overflow-y-auto">
        {!error && <CodeAndPreview pkg={pkg} />}
        {error &&
          (error.status === 404 ||
            !uuid4RegExp.test(pkg?.package_id ?? "")) && (
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
      </div>
    </div>
  )
}

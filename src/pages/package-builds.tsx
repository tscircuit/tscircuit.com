import { CodeAndPreview } from "@/components/package-port/CodeAndPreview"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { usePackage } from "@/hooks/use-package"
import { Helmet } from "react-helmet-async"
import { useCurrentPackageId } from "@/hooks/use-current-package-id"
import { NotFound } from "@/components/NotFound"
import { ErrorOutline } from "@/components/ErrorOutline"
import { DeploymentDetailsPage } from "@/components/PackageBuildsPage/DeploymentDetailsPage"

export const EditorPage = () => {
  const { packageId } = useCurrentPackageId()
  const { data: pkg, error } = usePackage(packageId)
  const uuid4RegExp = new RegExp(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
  )

  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <title>{pkg ? `${pkg.name} Package Builds` : "Package Builds"}</title>
        {pkg && (
          <>
            <meta property="og:title" content={`${pkg.name} Package Builds`} />
          </>
        )}
      </Helmet>
      <Header />
      <DeploymentDetailsPage />
      <Footer />
    </div>
  )
}

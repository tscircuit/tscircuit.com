import { useUrlParams } from "@/hooks/use-url-params"
import { type ReactNode, createContext, useContext } from "react"
import { useParams } from "wouter"

type PackagePreviewScope = {
  packageName: string
  releaseId: string
  previewFilePath?: string
  selectFile: (path: string) => void
  schematicSheet?: string
  selectSchematicSheet?: (name: string) => void
}

const Context = createContext<PackagePreviewScope | null>(null)

export function PackagePreviewProvider({
  value,
  children,
}: { value: PackagePreviewScope; children: ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const usePackagePreviewScope = () => useContext(Context)

/** Resolve package identity for both a package route and an embedded preview. */
export function usePackagePreviewIdentity() {
  const scope = usePackagePreviewScope()
  const route = useParams()
  const params = useUrlParams()
  const [scopeAuthor, scopeName] = scope?.packageName.split("/") ?? []
  return {
    author: scope ? scopeAuthor : route.author,
    packageName: scope ? scopeName : route.packageName,
    packageId: scope ? undefined : params.package_id,
    version: scope ? undefined : params.version,
    releaseId: scope ? scope.releaseId : params.package_release_id,
    previewFilePath: scope ? scope.previewFilePath : params.preview_file,
  }
}

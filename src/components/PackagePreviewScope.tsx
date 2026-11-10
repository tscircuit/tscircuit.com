import type { AnyCircuitElement } from "circuit-json"
import { useUrlParams } from "@/hooks/use-url-params"
import { type ReactNode, createContext, useContext } from "react"
import { useParams } from "wouter"

type PackagePreviewScope = {
  releaseId?: string
  previewFilePath?: string
  circuitJson: AnyCircuitElement[] | null
  glb?: ArrayBuffer
}

const Context = createContext<PackagePreviewScope | null>(null)

export function PackagePreviewProvider({
  value,
  children,
}: { value: PackagePreviewScope | null; children: ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>
}

/** Resolve package identity for both a package route and an embedded preview. */
export function usePackagePreviewIdentity() {
  const scope = useContext(Context)
  const route = useParams()
  const params = useUrlParams()
  return {
    preview: scope,
    author: route.author,
    packageName: route.packageName,
    packageId: params.package_id,
    version: params.version,
    releaseId: scope ? scope.releaseId : params.package_release_id,
    previewFilePath: scope ? scope.previewFilePath : params.preview_file,
  }
}

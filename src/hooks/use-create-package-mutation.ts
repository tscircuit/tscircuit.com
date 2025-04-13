import type { Package } from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"
import { useAxios } from "./use-axios"
import { useGlobalStore } from "./use-global-store"
import { useUrlParams } from "./use-url-params"

export const useCreatePackageMutation = ({
  onSuccess,
}: { onSuccess?: (pkg: Package) => void } = {}) => {
  const urlParams = useUrlParams()
  const templateName = urlParams.template
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)

  return useMutation(
    ["createPackage"],
    async ({
      name,
      description,
      is_private,
      is_unlisted,
    }: {
      name: string
      description?: string
      is_private?: boolean
      is_unlisted?: boolean
    }) => {
      if (!session) throw new Error("No session")
      console.log("creating package", {
        name,
        description,
        is_private,
        is_unlisted,
      })
      const {
        data: { package: newPackage },
      } = await axios.post("/packages/create", {
        name,
        description,
        is_private,
        is_unlisted,
      })

      if (!newPackage) {
        throw new Error("Failed to create package")
      }

      return newPackage
    },
    {
      onSuccess: (pkg: Package) => {
        const url = new URL(window.location.href)
        url.searchParams.set("package_id", pkg.package_id)
        url.searchParams.delete("template")
        url.searchParams.delete("should_create_package")
        window.history.pushState({}, "", url.toString())
        onSuccess?.(pkg)
        window.dispatchEvent(new Event("popstate"))
      },
      onError: (error: any) => {
        console.error("Error creating package:", error)
      },
    },
  )
}

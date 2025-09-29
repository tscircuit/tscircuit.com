import type { Package } from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"
import { useAxios } from "./use-axios"
import { useGlobalStore } from "./use-global-store"

export const useCreatePackageMutation = ({
  onSuccess,
}: { onSuccess?: (pkg: Package) => void } = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)

  return useMutation(
    ["createPackage"],
    async ({
      name,
      description,
      is_private,
      is_unlisted,
      org_id,
    }: {
      name?: string
      description?: string
      is_private?: boolean
      is_unlisted?: boolean
      org_id?: string
    }) => {
      if (!session) throw new Error("No session")

      const {
        data: { package: newPackage },
      } = await axios.post("/packages/create", {
        name,
        description,
        is_private,
        is_unlisted,
        org_id,
      })

      if (!newPackage) {
        throw new Error("Failed to create package")
      }

      return newPackage
    },
    {
      onSuccess: (pkg: Package) => {
        onSuccess?.(pkg)
      },
      onError: (error: any) => {
        console.error("Error creating package:", error)
      },
    },
  )
}

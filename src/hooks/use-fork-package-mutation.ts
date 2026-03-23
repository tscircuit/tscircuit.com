import { Package } from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"
import { useAxios } from "./use-axios"
import { useGlobalStore } from "./use-global-store"
import { useToast } from "./use-toast"

export const useForkPackageMutation = ({
  onSuccess,
}: {
  onSuccess?: (forkedPackage: Package) => void
} = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const { toast } = useToast()

  return useMutation(
    ["forkPackage"],
    async ({
      packageId,
      isPrivate,
    }: {
      packageId: string
      isPrivate?: boolean
    }) => {
      if (!session) throw new Error("No session")

      const { data } = await axios.post("/packages/fork", {
        package_id: packageId,
        is_private: isPrivate,
      })

      const forkedPackage: Package = data.package
      if (!forkedPackage) throw new Error("Failed to fork package")

      return forkedPackage
    },
    {
      onSuccess: (result) => {
        toast({
          title: "Package Forked",
          description: `Successfully forked package to @${session?.github_username}/${result.unscoped_name}`,
        })

        const url = new URL(window.location.href)
        url.pathname = `/${session?.github_username}/${result.unscoped_name}`
        url.search = ""
        window.location.href = url.toString()

        onSuccess?.(result)
      },
      onError: (error: any) => {
        const message = error?.data?.error?.message || error?.message
        const errorCode =
          error?.data?.error?.error_code || error?.data?.error_code

        if (errorCode === "cannot_fork_own_package") {
          toast({
            title: "Cannot Fork Package",
            description: message || "You cannot fork your own package.",
          })
          return
        }
        if (errorCode === "already_forked") {
          toast({
            title: "Already Forked",
            description: message || "You have already forked this package.",
            variant: "destructive",
          })
          return
        }
        toast({
          title: "Error",
          description: message || "Failed to fork package. Please try again.",
          variant: "destructive",
        })
      },
    },
  )
}

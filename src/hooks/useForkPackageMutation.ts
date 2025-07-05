import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useToast } from "@/hooks/use-toast"
import { Package } from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"

export const useForkPackageMutation = ({
  pkg,
  currentCode,
  onSuccess,
}: {
  pkg: Package
  currentCode?: string
  onSuccess?: (forkedSnippet: Package) => void
}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const { toast } = useToast()

  return useMutation(
    ["createForkSnippet"],
    async () => {
      if (!session) throw new Error("No session")
      if (!pkg) throw new Error("No package to fork")

      const { data } = await axios.post("/packages/fork", {
        package_id: pkg?.package_id,
      })
      return data.package
    },
    {
      onSuccess: (forkedPkg: Package) => {
        toast({
          title: `Forked Package`,
          description: `You have successfully forked the package. Redirecting...`,
        })
        onSuccess?.(forkedPkg)
      },
      onError: (error: any) => {
        console.error("Error forking package:", error)
        const message = error?.data?.error?.message
        toast({
          title: "Error",
          description: message || "Failed to fork package. Please try again.",
          variant: "destructive",
        })
      },
    },
  )
}

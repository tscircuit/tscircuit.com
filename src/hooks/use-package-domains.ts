import type { PublicPackageDomain } from "fake-snippets-api/lib/db/schema"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { useAxios } from "./use-axios"
import { useToast } from "./use-toast"

export const usePackageDomains = (
  query: {
    package_release_id?: string | null
    package_id?: string | null
  } | null,
) => {
  const axios = useAxios()

  return useQuery<PublicPackageDomain[], Error & { status: number }>(
    ["packageDomains", query],
    async () => {
      if (!query) return []
      const { data } = await axios.get("/package_domains/list", {
        params: query,
      })
      return data.package_domains || []
    },
    {
      enabled: Boolean(query?.package_release_id || query?.package_id),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  )
}

export const useUpdatePackageDomain = () => {
  const axios = useAxios()
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (params: {
      package_domain_id: string
      fully_qualified_domain_name?: string | null
    }) => {
      const { data } = await axios.post("/package_domains/update", params)
      return data.package_domain as PublicPackageDomain
    },
    onSuccess: () => {
      qc.invalidateQueries(["packageDomains"])
      toast({ title: "Saved", description: "Domain updated successfully." })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error?.data?.error?.message ||
          error?.message ||
          "Failed to update domain.",
        variant: "destructive",
      })
    },
  })
}

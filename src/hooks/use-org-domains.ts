import type { PublicOrgDomain } from "fake-snippets-api/lib/db/schema"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { useAxios } from "./use-axios"
import { useToast } from "./use-toast"

export const useOrgDomains = (orgId: string | null | undefined) => {
  const axios = useAxios()

  return useQuery<PublicOrgDomain[], Error & { status: number }>(
    ["orgDomains", orgId],
    async () => {
      if (!orgId) return []
      const { data } = await axios.get("/org_domains/list", {
        params: { org_id: orgId },
      })
      return data.org_domains || []
    },
    {
      enabled: Boolean(orgId),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  )
}

export const useCreateOrgDomain = () => {
  const axios = useAxios()
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (params: {
      org_id: string
      fully_qualified_domain_name: string
      points_to: "merged_pcm_repositories"
    }) => {
      const { data } = await axios.post("/org_domains/create", params)
      return data.org_domain as PublicOrgDomain
    },
    onSuccess: () => {
      qc.invalidateQueries(["orgDomains"])
      toast({ title: "Created", description: "Domain created successfully." })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error?.data?.error?.message ||
          error?.message ||
          "Failed to create domain.",
        variant: "destructive",
      })
    },
  })
}

export const useAddOrgDomainLinkedPackage = () => {
  const axios = useAxios()
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (params: {
      org_domain_id: string
      points_to: "package_release"
      package_release_id: string
    }) => {
      const { data } = await axios.post(
        "/org_domains/add_linked_package",
        params,
      )
      return data.org_domain as PublicOrgDomain
    },
    onSuccess: () => {
      qc.invalidateQueries(["orgDomains"])
      toast({
        title: "Package linked",
        description: "Package added to domain.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error?.data?.error?.message ||
          error?.message ||
          "Failed to add linked package.",
        variant: "destructive",
      })
    },
  })
}

export const useRemoveOrgDomainLinkedPackage = () => {
  const axios = useAxios()
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (params: {
      org_domain_id: string
      org_domain_linked_package_id: string
    }) => {
      const { data } = await axios.post(
        "/org_domains/remove_linked_package",
        params,
      )
      return data.org_domain as PublicOrgDomain
    },
    onSuccess: () => {
      qc.invalidateQueries(["orgDomains"])
      toast({
        title: "Package removed",
        description: "Package removed from domain.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error?.data?.error?.message ||
          error?.message ||
          "Failed to remove linked package.",
        variant: "destructive",
      })
    },
  })
}

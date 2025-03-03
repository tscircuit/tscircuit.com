import { useAxios } from "@/hooks/use-axios"
import type {
  Package,
  PackageFile,
  Snippet,
} from "fake-snippets-api/lib/db/schema"
import { useQuery } from "react-query"

export const usePackageAsSnippet = (packageId: string | null) => {
  const axios = useAxios()

  console.log("packageId", packageId)

  const packageQuery = useQuery<Package, Error & { status: number }>(
    ["packages", packageId],
    async () => {
      if (!packageId) {
        throw new Error("Package ID is required")
      }
      const { data } = await axios.get("/packages/get", {
        params: { package_id: packageId },
      })
      return data.package
    },
    {
      enabled: Boolean(packageId),
      retry: false,
    },
  )

  const filesQuery = useQuery<PackageFile[], Error & { status: number }>(
    ["package-files", packageQuery.data?.latest_package_release_id],
    async () => {
      if (!packageQuery.data?.latest_package_release_id) {
        throw new Error("No latest release ID available")
      }
      const { data } = await axios.post("/package_files/list", {
        package_release_id: packageQuery.data.latest_package_release_id,
      })
      return data.package_files
    },
    {
      enabled: Boolean(packageQuery.data?.latest_package_release_id),
      retry: false,
      // Add these options to ensure proper sequencing
      staleTime: 0,
      cacheTime: 0,
    },
  )

  // Map package data to match Snippet structure
  const snippetData: Snippet | undefined = packageQuery.data && {
    snippet_id: packageId!,
    package_release_id: packageQuery.data.latest_package_release_id || "",
    unscoped_name: packageQuery.data.unscoped_name,
    name: packageQuery.data.name,
    is_starred: false,
    version: packageQuery.data.latest_version || "",
    owner_name: packageQuery.data.owner_github_username || "",
    description: packageQuery.data.description || "",
    snippet_type: "board",
    code:
      filesQuery.data?.find((file) => file.file_path === "index.tsx")
        ?.content_text || "",
    manual_edits_json_content:
      filesQuery.data?.find((file) => file.file_path === "manual-edits.json")
        ?.content_text || "",
    created_at: packageQuery.data.created_at,
    updated_at: packageQuery.data.updated_at,
    star_count: packageQuery.data.star_count,
  }

  return {
    data: snippetData,
    isLoading: packageQuery.isLoading || filesQuery.isLoading,
    error: packageQuery.error || filesQuery.error,
  }
}
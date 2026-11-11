import { parsePreviewParameterManifest } from "@/lib/package-preview-parameters"
import { useQuery } from "react-query"
import { useAxios } from "./use-axios"
import { useCurrentPackageRelease } from "./use-current-package-release"
import { useGlobalStore } from "./use-global-store"
import { usePackageFiles } from "./use-package-files"
import { useApiBaseUrl } from "./use-packages-base-api-url"

type PackagePreviewFile = { file_path: string; package_file_id: string }

export function usePackagePreviewManifest({
  releaseId,
  files,
}: { releaseId?: string; files?: PackagePreviewFile[] }) {
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((s) => s.session?.token)
  const file = files?.find((f) => f.file_path === "dist/preview.json")
  return useQuery(
    [
      "packagePreviewParameters",
      releaseId,
      file?.package_file_id,
      apiBaseUrl,
      token,
    ],
    async () => {
      const { data } = await axios.get("/package_files/get", {
        params: { package_file_id: file!.package_file_id },
      })
      return parsePreviewParameterManifest({
        manifest: JSON.parse(data.package_file.content_text),
        files: files!,
      })
    },
    {
      enabled: Boolean(file),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )
}

export function usePackagePreviewParameters() {
  const { packageRelease } = useCurrentPackageRelease({ refetchOnMount: false })
  const releaseId = packageRelease?.package_release_id
  const { data: files } = usePackageFiles(releaseId, { refetchOnMount: false })
  const query = usePackagePreviewManifest({ releaseId, files })
  return { manifest: query.data, error: query.error }
}

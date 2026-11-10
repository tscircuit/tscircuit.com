import { useQuery, useQueryClient } from "react-query"
import { useCurrentPackageRelease } from "./use-current-package-release"
import { usePackageFiles } from "./use-package-files"
import { useAxios } from "./use-axios"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { useGlobalStore } from "./use-global-store"
import {
  downloadPreviewCircuitBundle,
  parsePreviewParameterManifest,
  previewParameterManifestSchema,
  type PreviewParameterManifest,
} from "@/lib/package-preview-parameters"
import { downloadPackagePreviewGlb } from "@/lib/package-preview-glb"

export function usePackagePreviewParameters() {
  const { packageRelease } = useCurrentPackageRelease({ refetchOnMount: false })
  const releaseId = packageRelease?.package_release_id
  const { data: files } = usePackageFiles(releaseId, { refetchOnMount: false })
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((s) => s.session?.token)
  const file = files?.find((f) => f.file_path === "dist/preview.json")
  const query = useQuery(
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
      const manifest = previewParameterManifestSchema.parse(
        JSON.parse(data.package_file.content_text),
      )
      let schema: unknown
      if (manifest.version === 2) {
        const schemaFile = files!.find(
          (f) => f.file_path === manifest.propsSchemaPath,
        )
        if (!schemaFile)
          throw new Error("The package build's props schema is missing")
        const { data } = await axios.get("/package_files/get", {
          params: { package_file_id: schemaFile.package_file_id },
        })
        schema = JSON.parse(data.package_file.content_text)
      }
      return parsePreviewParameterManifest(manifest, files!, schema)
    },
    {
      enabled: Boolean(file),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )
  return {
    manifest: query.data,
    files,
    releaseId,
    error: query.error,
    isLoading: Boolean(file) && query.isLoading,
  }
}

export function usePreparedPackageParameters(
  manifest: PreviewParameterManifest,
) {
  const { files, releaseId } = usePackagePreviewParameters()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((s) => s.session?.token)
  const client = useQueryClient()
  const query = useQuery(
    ["preparedPackageParameters", releaseId, apiBaseUrl, token],
    async ({ signal }) => {
      const bundleFile = files!.find(
        (f) => f.file_path === manifest.bundlePath,
      )!
      const circuits = await downloadPreviewCircuitBundle({
        apiBaseUrl,
        packageFileId: bundleFile.package_file_id,
        token,
        signal,
        manifest,
      })
      const buffers: Record<string, ArrayBuffer> = {}
      const paths = [...new Set(manifest.variants.map((v) => v.glbPath))]
      // Keep downloads bounded; the manifest shares geometry between value states.
      const pending = [...paths]
      await Promise.all(
        Array.from({ length: Math.min(3, paths.length) }, async () => {
          while (pending.length) {
            const path = pending.shift()!
            const file = files!.find((f) => f.file_path === path)!
            const data = await downloadPackagePreviewGlb({
              apiBaseUrl,
              packageFileId: file.package_file_id,
              token,
              signal,
            })
            buffers[file.package_file_id] = data
            client.setQueryData(
              ["packagePreviewGlb", apiBaseUrl, file.package_file_id, token],
              data,
            )
          }
        }),
      )
      for (const variant of manifest.variants) {
        const file = files!.find(
          (f) => f.file_path === variant.circuitJsonPath,
        )!
        client.setQueryData(
          [
            "previewCircuitJson",
            { package_release_id: releaseId },
            file.package_file_id,
            apiBaseUrl,
            token,
          ],
          {
            preview_circuit_json_response: {
              circuit_json: circuits[variant.circuitJsonPath],
              component_path: variant.circuitJsonPath,
              circuit_json_found: true,
            },
          },
        )
      }
      return { circuits, buffers }
    },
    {
      enabled: Boolean(files && releaseId),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )
  const prime = (variant: PreviewParameterManifest["variants"][number]) => {
    if (!query.data) throw new Error("Parameters are not ready")
    const file = files!.find((f) => f.file_path === variant.circuitJsonPath)!
    const glb = files!.find((f) => f.file_path === variant.glbPath)!
    client.setQueryData(
      [
        "previewCircuitJson",
        { package_release_id: releaseId },
        file.package_file_id,
        apiBaseUrl,
        token,
      ],
      {
        preview_circuit_json_response: {
          circuit_json: query.data.circuits[variant.circuitJsonPath],
          component_path: variant.circuitJsonPath,
          circuit_json_found: true,
        },
      },
    )
    client.setQueryData(
      ["packagePreviewGlb", apiBaseUrl, glb.package_file_id, token],
      query.data.buffers[glb.package_file_id],
    )
  }
  return { ...query, prime }
}

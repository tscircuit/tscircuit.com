import { downloadPackagePreviewGlb } from "@/lib/package-preview-glb"
import {
  downloadPreviewCircuitBundle,
  findParameterVariant,
  findParameterVariantByPath,
  type PreviewParameterValues,
} from "@/lib/package-preview-parameters"
import type { PackagePreviewSelection } from "@/lib/package-preview-selection"
import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "react-query"
import { useGlobalStore } from "./use-global-store"
import { usePackageByName } from "./use-package-by-package-name"
import { usePackageFiles } from "./use-package-files"
import { usePackagePreviewManifest } from "./use-package-preview-parameters"
import { usePackageRelease } from "./use-package-release"
import { useApiBaseUrl } from "./use-packages-base-api-url"

export function usePackageConfiguration({
  name,
  selection,
}: { name: string; selection: PackagePreviewSelection }) {
  const pkg = usePackageByName(name)
  const [snapshot, setSnapshot] = useState<{
    name: string
    releaseId: string
  }>()
  const builtReleaseId =
    pkg.data?.last_built_release_id ?? pkg.data?.latest_package_release_id
  useEffect(() => {
    if (builtReleaseId && snapshot?.name !== name)
      setSnapshot({ name, releaseId: builtReleaseId })
  }, [name, builtReleaseId, snapshot?.name])
  const releaseId =
    selection.release ||
    (snapshot?.name === name ? snapshot.releaseId : builtReleaseId) ||
    undefined
  const release = usePackageRelease(
    releaseId ? { package_release_id: releaseId } : null,
    { refetchOnMount: false },
  )
  const files = usePackageFiles(releaseId, { refetchOnMount: false })
  const manifestQuery = usePackagePreviewManifest({
    releaseId,
    files: files.data,
  })
  const manifest = manifestQuery.data
  const variant = manifest
    ? findParameterVariantByPath(manifest, selection.file)
    : undefined
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((s) => s.session?.token)
  const client = useQueryClient()
  const view = selection.view ?? "schematic"

  const circuits = useQuery(
    ["packageConfigurationCircuits", releaseId, apiBaseUrl, token],
    async ({ signal }) => {
      const file = files.data!.find(
        (f) => f.file_path === manifest!.bundlePath,
      )!
      const bundle = await downloadPreviewCircuitBundle({
        apiBaseUrl,
        packageFileId: file.package_file_id,
        token,
        signal,
        manifest: manifest!,
      })
      for (const state of manifest!.variants) {
        const circuitFile = files.data!.find(
          (f) => f.file_path === state.circuitJsonPath,
        )!
        client.setQueryData(
          [
            "previewCircuitJson",
            { package_release_id: releaseId },
            circuitFile.package_file_id,
            apiBaseUrl,
            token,
          ],
          {
            preview_circuit_json_response: {
              circuit_json: bundle[state.circuitJsonPath],
              component_path: state.circuitJsonPath,
              circuit_json_found: true,
            },
          },
        )
      }
      return bundle
    },
    {
      enabled: Boolean(manifest),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )
  const models = useQuery(
    ["packageConfigurationModels", releaseId, apiBaseUrl, token],
    async ({ signal }) => {
      const buffers: Record<string, ArrayBuffer> = {}
      const pending = [
        ...new Set(manifest!.variants.map((state) => state.glbPath)),
      ]
      await Promise.all(
        Array.from({ length: Math.min(3, pending.length) }, async () => {
          while (pending.length) {
            const path = pending.shift()!
            const file = files.data!.find((f) => f.file_path === path)!
            const buffer = await downloadPackagePreviewGlb({
              apiBaseUrl,
              packageFileId: file.package_file_id,
              token,
              signal,
            })
            buffers[file.package_file_id] = buffer
            client.setQueryData(
              ["packagePreviewGlb", apiBaseUrl, file.package_file_id, token],
              buffer,
            )
          }
        }),
      )
      return buffers
    },
    {
      enabled: Boolean(manifest && circuits.data && view === "3d"),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )

  const selectParameters = (values: PreviewParameterValues) => {
    if (!manifest || !circuits.data) return
    const next = findParameterVariant(manifest, values)!
    // Re-prime after inactive viewer queries have been garbage collected.
    const file = files.data!.find((f) => f.file_path === next.circuitJsonPath)!
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
          circuit_json: circuits.data[next.circuitJsonPath],
          component_path: next.circuitJsonPath,
          circuit_json_found: true,
        },
      },
    )
    const glb = files.data!.find((f) => f.file_path === next.glbPath)!
    if (models.data?.[glb.package_file_id])
      client.setQueryData(
        ["packagePreviewGlb", apiBaseUrl, glb.package_file_id, token],
        models.data[glb.package_file_id],
      )
    return next.circuitJsonPath
  }

  const hasManifest = files.data?.some(
    (f) => f.file_path === "dist/preview.json",
  )
  const metadataReady = Boolean(
    pkg.data && release.data && files.data && (!hasManifest || manifest),
  )
  const mismatchedRelease =
    pkg.data && release.data && pkg.data.package_id !== release.data.package_id
  const error =
    pkg.error ||
    release.error ||
    files.error ||
    manifestQuery.error ||
    circuits.error ||
    (view === "3d" && models.error) ||
    (pkg.data && !releaseId
      ? new Error("This package has no built release.")
      : null) ||
    (mismatchedRelease
      ? new Error("This release does not belong to the selected package.")
      : null)
  const ready =
    metadataReady &&
    (!manifest || Boolean(circuits.data && (view !== "3d" || models.data)))
  return {
    name,
    selection,
    view,
    releaseId,
    manifest,
    variant,
    packageInfo: pkg.data,
    packageRelease: release.data,
    packageError: pkg.error || release.error,
    files: files.data,
    ready,
    metadataReady,
    error,
    selectParameters,
    circuitJson: variant ? circuits.data?.[variant.circuitJsonPath] : undefined,
    scope: releaseId
      ? {
          packageName: name,
          releaseId,
          previewFilePath: variant?.circuitJsonPath ?? selection.file,
        }
      : null,
    retry: () => {
      if (pkg.error) void pkg.refetch()
      if (release.error) void release.refetch()
      if (files.error) void files.refetch()
      if (manifestQuery.error) void manifestQuery.refetch()
      if (circuits.error) void circuits.refetch()
      if (models.error) void models.refetch()
    },
  }
}

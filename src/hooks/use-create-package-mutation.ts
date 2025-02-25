import { getSnippetTemplate } from "@/lib/get-snippet-template"
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
      code,
      circuit_json,
      manual_edits_json_content,
    }: {
      code?: string
      circuit_json?: any[]
      manual_edits_json_content?: string
    } = {}) => {
      if (!session) throw new Error("No session")
      const template =
        typeof code === "string"
          ? {
              code,
              type:
                urlParams.type ||
                (code.includes("<board") ? "board" : "package"),
            }
          : getSnippetTemplate(templateName)

      // First create the package
      const { data: packageData } = await axios.post("/packages/create", {})

      // Create initial package release
      const { data: releaseData } = await axios.post(
        "/package_releases/create",
        {
          package_id: packageData.package.package_id,
          version: "0.0.1",
          is_latest: true,
        },
      )

      // Add package files
      await Promise.all([
        // Main code file
        axios.post("/package_files/create", {
          package_release_id: releaseData.package_release.package_release_id,
          file_path: "index.tsx",
          content_text: template.code,
        }),
        // Package.json
        axios.post("/package_files/create", {
          package_release_id: releaseData.package_release.package_release_id,
          file_path: "manual_edits.json",
          content_text: manual_edits_json_content,
        }),
      ])

      return packageData.package
    },
    {
      onSuccess: (pkg: Package) => {
        console.log("pkg", pkg)
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

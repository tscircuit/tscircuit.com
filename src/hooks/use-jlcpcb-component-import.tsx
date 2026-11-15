import React, { useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useLocation } from "wouter"
import { useCreatePackageMutation } from "@/hooks/use-create-package-mutation"
import { useCreatePackageReleaseMutation } from "@/hooks/use-create-package-release-mutation"
import { useUpdatePackageReleaseMutation } from "@/hooks/use-update-package-release-mutation"
import { useCreatePackageFilesMutation } from "@/hooks/use-create-package-files-mutation"
import { useAxios } from "@/hooks/use-axios"
import { JlcpcbComponentTsxLoadedPayload } from "@tscircuit/runframe/runner"

// Build the import specifier a user types for a package. The package name is
// "owner/name"; the specifier replaces the first slash with a dot.
const getImportSpecifier = (packageName: string) =>
  `@tsci/${packageName.replace("/", ".")}`

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard access can fail outside a user gesture. The specifier still
    // shows in the toast, so the user can copy it by hand.
  }
}

export const useJlcpcbComponentImport = () => {
  const { toastLibrary } = useToast()
  const session = useGlobalStore((s) => s.session)
  const [, navigate] = useLocation()
  const axios = useAxios()
  const createPackageMutation = useCreatePackageMutation()
  const createReleaseMutation = useCreatePackageReleaseMutation()
  const updateReleaseMutation = useUpdatePackageReleaseMutation()
  const createFilesMutation = useCreatePackageFilesMutation()

  const runImport = useCallback(
    async ({ result, tsx }: JlcpcbComponentTsxLoadedPayload) => {
      if (!session) {
        throw new Error("You must be signed in to import from JLCPCB")
      }

      const owner = session.github_username || session.tscircuit_handle
      if (!owner) {
        throw new Error(
          "Set a tscircuit handle in your settings before you import from JLCPCB.",
        )
      }

      const partNumber = result.component.partNumber || "component"

      const normalizePartNumber = (input: string) =>
        input
          .replace(/^@/, "")
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-_/]/g, "-")
          .replace(/--+/g, "-")
          .replace(/-+$/g, "")
          .replace(/^-+/g, "") || "component"

      const componentSlug = normalizePartNumber(partNumber)
      const packageName = `${owner}/${componentSlug}`
      const importSpecifier = getImportSpecifier(packageName)

      const fetchExistingPackage = async () => {
        try {
          const { data } = await axios.post("/packages/get", {
            name: packageName,
          })
          return data.package
        } catch (error: any) {
          const status = error?.response?.status || error?.status
          if (status === 404) return null
          throw error
        }
      }

      const existingPackage = await fetchExistingPackage()
      if (existingPackage) {
        await copyToClipboard(importSpecifier)
        navigate(`/editor?package_id=${existingPackage.package_id}`)
        return {
          partNumber,
          importSpecifier,
          packageId: existingPackage.package_id,
          existing: true,
        }
      }

      const description =
        result.component.description ||
        `Generated from JLCPCB part number ${partNumber}`

      let newPackage
      try {
        newPackage = await createPackageMutation.mutateAsync({
          name: packageName,
          description,
        })
      } catch (error) {
        const fallbackPackage = await fetchExistingPackage()
        if (fallbackPackage) {
          await copyToClipboard(importSpecifier)
          navigate(`/editor?package_id=${fallbackPackage.package_id}`)
          return {
            partNumber,
            importSpecifier,
            packageId: fallbackPackage.package_id,
            existing: true,
          }
        }
        throw error
      }

      const release = await createReleaseMutation.mutateAsync({
        package_id: newPackage.package_id,
        version: "0.1.0",
        is_latest: true,
      })

      await createFilesMutation.mutateAsync({
        file_path: "index.tsx",
        content_text: tsx,
        package_release_id: release.package_release_id,
      })

      // Mark the release ready to build. Without this the editor opens on a
      // release with no build and surfaces a raw "no files in dist" error.
      await updateReleaseMutation.mutateAsync({
        package_release_id: release.package_release_id,
        ready_to_build: true,
      })

      await copyToClipboard(importSpecifier)
      navigate(`/editor?package_id=${newPackage.package_id}`)
      return {
        partNumber,
        importSpecifier,
        packageId: newPackage.package_id,
        existing: false,
      }
    },
    [
      createFilesMutation,
      createPackageMutation,
      createReleaseMutation,
      updateReleaseMutation,
      axios,
      navigate,
      session,
    ],
  )

  const importComponent = useCallback(
    async (payload: JlcpcbComponentTsxLoadedPayload) => {
      const importPromise = runImport(payload)

      toastLibrary.promise(importPromise, {
        loading: "Importing component...",
        success: ({ partNumber, importSpecifier, existing }) => (
          <div>
            <p>
              {existing
                ? `Component ${partNumber} already exists. Opening package in the editor.`
                : `Component ${partNumber} imported. The release is building.`}
            </p>
            <p>
              Import it with{" "}
              <code className="font-mono">
                import {"{ ... }"} from "{importSpecifier}"
              </code>{" "}
              (copied to your clipboard).
            </p>
          </div>
        ),
        error: (error) => (
          <p>
            {error instanceof Error
              ? error.message
              : "Failed to import component"}
          </p>
        ),
      })

      await importPromise
    },
    [runImport, toastLibrary],
  )

  return {
    importComponent,
  }
}

export const openJlcpcbImportIssue = (
  partNumber: string,
  errorMessage: string,
) => {
  const url = getJlcpcbImportIssueUrl(partNumber, errorMessage)
  window.open(url, "_blank")
}

const getJlcpcbImportIssueUrl = (partNumber: string, errorMessage: string) => {
  const issueTitle = `[${partNumber}] Failed to import from JLCPCB`
  const issueBody = `I tried to import the part number ${partNumber} from JLCPCB, but it failed. Here's the error I got:\n\`\`\`\n${errorMessage}\n\`\`\`\n\nCould be an issue in \`fetchEasyEDAComponent\` or \`convertRawEasyEdaToTs\``
  const issueLabels = "snippets,good first issue"
  const url = `https://github.com/tscircuit/easyeda-converter/issues/new?title=${encodeURIComponent(
    issueTitle,
  )}&body=${encodeURIComponent(issueBody)}&labels=${encodeURIComponent(issueLabels)}`
  return url
}

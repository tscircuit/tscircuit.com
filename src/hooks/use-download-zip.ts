import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"
import { useAxios } from "@/hooks/use-axios"
import { Package, PackageFile } from "fake-snippets-api/lib/db/schema"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { useCallback } from "react"

export const useDownloadZip = () => {
  const axios = useAxios()

  const downloadZip = useCallback(
    async (packageInfo: Package, packageFiles: PackageFile[]) => {
      if (!packageInfo || !packageFiles) return

      const zip = new JSZip()

      const visibleFiles = packageFiles.filter(
        (file) => !isHiddenFile(file.file_path),
      )

      for (const file of visibleFiles) {
        try {
          const response = await axios.post("/package_files/get", {
            package_file_id: file.package_file_id,
          })

          const content = response.data.package_file?.content_text || ""

          const cleanPath = file.file_path.startsWith("/")
            ? file.file_path.slice(1)
            : file.file_path

          zip.file(cleanPath, content)
        } catch (error) {
          console.error(
            `Failed to fetch content for file ${file.file_path}:`,
            error,
          )
        }
      }

      const blob = await zip.generateAsync({ type: "blob" })
      const fileName = `${packageInfo.unscoped_name || packageInfo.name}.zip`
      saveAs(blob, fileName)
    },
    [axios],
  )

  return { downloadZip }
}

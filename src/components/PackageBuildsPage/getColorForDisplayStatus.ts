import type { PackageRelease } from "fake-snippets-api/lib/db/schema"

export const getColorForDisplayStatus = (
  display_status?: PackageRelease["display_status"] | null,
) => {
  switch (display_status) {
    case "pending":
      return "bg-yellow-500"
    case "building":
      return "bg-blue-500"
    case "complete":
      return "bg-green-500"
    case "error":
      return "bg-red-500"
  }
  return "bg-gray-500"
}

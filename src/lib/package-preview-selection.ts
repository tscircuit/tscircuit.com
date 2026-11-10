export type PackagePreviewSelection = {
  release?: string
  file?: string
  sheet?: string
  view?: string
}

export function readPackagePreviewSelection(
  location: string,
): PackagePreviewSelection {
  const [search, hash] = location.split("#")
  const params = new URLSearchParams(search)
  return {
    release: params.get("package_release_id") ?? undefined,
    file: params.get("preview_file") ?? undefined,
    sheet: params.get("schematic_sheet") ?? undefined,
    view: ["schematic", "pcb", "3d"].includes(hash) ? hash : "schematic",
  }
}

export function updatePackagePreviewSelection(
  selection: PackagePreviewSelection,
) {
  const url = new URL(window.location.href)
  for (const [key, selectionValue] of Object.entries({
    package_release_id: selection.release,
    preview_file: selection.file,
    schematic_sheet: selection.sheet,
  })) {
    if (selectionValue) url.searchParams.set(key, selectionValue)
    else url.searchParams.delete(key)
  }
  url.hash = selection.view ?? "schematic"
  if (url.href === window.location.href) return
  window.history.pushState({}, "", url)
  window.dispatchEvent(new Event("popstate"))
}

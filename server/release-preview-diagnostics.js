// Use the same public endpoint as the static build viewer, without credentials.
export async function fetchReleasePreviewDiagnostics({
  route,
  packageInfo,
  packageRelease,
  registryUrl,
  fetchJson,
}) {
  if (
    route.kind !== "preview" ||
    packageInfo.is_private ||
    packageInfo.is_public === false ||
    !packageRelease?.package_release_id ||
    packageRelease.package_id !== packageInfo.package_id
  ) {
    return null
  }

  const url = new URL(
    "package_releases/get_preview_circuit_json",
    `${registryUrl}/`,
  )
  url.searchParams.set("package_release_id", packageRelease.package_release_id)
  const response = await fetchJson(url)
  const preview = response?.preview_circuit_json_response
  if (!preview?.circuit_json_found || !Array.isArray(preview.circuit_json)) {
    return null
  }

  return {
    componentPath: preview.component_path ?? null,
    diagnostics: preview.circuit_json.filter(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        ("error_type" in entry ||
          "warning_type" in entry ||
          (typeof entry.type === "string" &&
            /(?:error|warning)/.test(entry.type))),
    ),
  }
}

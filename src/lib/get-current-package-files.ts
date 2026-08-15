type PackageFileMetadata = {
  file_path: string
}

type LoadedPackageFile = {
  path: string
}

/**
 * Return only files that still exist in the latest package metadata.
 *
 * Loaded file contents are cached by path and can outlive a metadata refetch.
 * Filtering through the metadata prevents renamed or deleted paths from being
 * reintroduced into the editor while their stale cache entries still exist.
 */
export function getCurrentPackageFiles<T extends LoadedPackageFile>(
  packageFiles: readonly PackageFileMetadata[],
  loadedFiles: ReadonlyMap<string, T>,
): T[] {
  return packageFiles.flatMap((packageFile) => {
    const loadedFile = loadedFiles.get(packageFile.file_path)
    return loadedFile ? [loadedFile] : []
  })
}

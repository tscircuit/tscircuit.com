export interface PackageBuildReference {
  package_build_id: string
  package_release_id: string
}

interface WaitForNewPackageBuildOptions {
  existingBuildIds: ReadonlySet<string>
  listBuilds: () => Promise<PackageBuildReference[]>
  pollIntervalMs?: number
  timeoutMs?: number
}

const delay = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs))

export const waitForNewPackageBuild = async ({
  existingBuildIds,
  listBuilds,
  pollIntervalMs = 2_000,
  timeoutMs = 120_000,
}: WaitForNewPackageBuildOptions): Promise<PackageBuildReference> => {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const builds = await listBuilds()
    const newBuild = builds.find(
      (build) => !existingBuildIds.has(build.package_build_id),
    )

    if (newBuild) return newBuild

    await delay(Math.min(pollIntervalMs, Math.max(0, deadline - Date.now())))
  }

  throw new Error("Timed out waiting for the GitHub sync build")
}

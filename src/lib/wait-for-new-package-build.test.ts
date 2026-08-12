import { expect, test } from "bun:test"
import {
  type PackageBuildReference,
  waitForNewPackageBuild,
} from "./wait-for-new-package-build"

test("waits until a build that did not exist before the sync is available", async () => {
  const existingBuild: PackageBuildReference = {
    package_build_id: "existing-build",
    package_release_id: "existing-release",
  }
  const newBuild: PackageBuildReference = {
    package_build_id: "new-build",
    package_release_id: "new-release",
  }
  const responses = [
    [existingBuild],
    [existingBuild],
    [newBuild, existingBuild],
  ]
  let requestCount = 0

  const result = await waitForNewPackageBuild({
    existingBuildIds: new Set([existingBuild.package_build_id]),
    listBuilds: async () => responses[requestCount++] ?? responses.at(-1)!,
    pollIntervalMs: 0,
    timeoutMs: 100,
  })

  expect(result).toEqual(newBuild)
  expect(requestCount).toBe(3)
})

test("detects a new build when an existing release is rebuilt", async () => {
  const result = await waitForNewPackageBuild({
    existingBuildIds: new Set(["old-build"]),
    listBuilds: async () => [
      {
        package_build_id: "new-build",
        package_release_id: "same-release",
      },
    ],
    pollIntervalMs: 0,
    timeoutMs: 100,
  })

  expect(result).toEqual({
    package_build_id: "new-build",
    package_release_id: "same-release",
  })
})

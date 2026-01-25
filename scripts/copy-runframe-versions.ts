import { join } from "node:path"
// @ts-expect-error - JSON import resolved by Bun
import runframePackageJson from "@tscircuit/runframe/package.json"
import currentPackageJson from "../package.json"

const SYNC_PACKAGES = [
  "@tscircuit/pcb-viewer",
  "@tscircuit/3d-viewer",
  "@tscircuit/schematic-viewer",
]

const runframePackageJsonAny = runframePackageJson as Record<string, unknown>
const runframeDeps: Record<string, string> = {
  ...((runframePackageJsonAny.devDependencies as
    | Record<string, string>
    | undefined) ?? {}),
  ...((runframePackageJsonAny.dependencies as
    | Record<string, string>
    | undefined) ?? {}),
}

const depsToUpdate: Record<string, string> = {}
let modifiedDeps = false

const packageJsonPath = join(import.meta.dirname, "../package.json")
const packageJsonText = await Bun.file(packageJsonPath).text()
const packageJsonData = JSON.parse(packageJsonText) as {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

for (const packageName of SYNC_PACKAGES) {
  const runframeVersion = runframeDeps[packageName]
  if (!runframeVersion) {
    continue
  }
  const currentVersion =
    packageJsonData.dependencies?.[packageName] ??
    packageJsonData.devDependencies?.[packageName]
  if (!currentVersion) {
    continue
  }
  if (currentVersion === runframeVersion) {
    continue
  }
  console.log(
    `Updating ${packageName} from ${currentVersion} to ${runframeVersion}`,
  )
  depsToUpdate[packageName] = runframeVersion
  if (packageJsonData.dependencies?.[packageName]) {
    packageJsonData.dependencies[packageName] = runframeVersion
  }
  if (packageJsonData.devDependencies?.[packageName]) {
    packageJsonData.devDependencies[packageName] = runframeVersion
  }
  modifiedDeps = true
}

if (modifiedDeps) {
  await Bun.write(
    packageJsonPath,
    `${JSON.stringify(packageJsonData, null, 2)}\n`,
  )
}

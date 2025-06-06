import fs from "fs"
import path from "path"
import axios from "redaxios"
import type { DbClient } from "./db-client"
import type { Package, PackageFile, PackageRelease } from "./schema"

const extractTsciDependencies = (
  code: string,
): Array<{ owner: string; name: string }> => {
  const regex = /@tsci\/([^.]+)\.([^"'\s]+)/g
  const matches = Array.from(code.matchAll(regex))
  return matches.map((match) => ({
    owner: match[1],
    name: match[2],
  }))
}

const registryApi = axios.create({
  baseURL: "https://registry-api.tscircuit.com",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

const fetchPackageFromRegistry = async (owner: string, name: string) => {
  const fullName = `${owner}/${name}`
  console.log(`Fetching package ${fullName}...`)

  let packageData
  try {
    const response = await registryApi.post("/packages/get", {
      name: fullName,
    })
    packageData = response.data
  } catch (e) {
    console.error(`Failed to fetch package data for ${fullName}:`, e)
    throw e
  }

  let releaseData
  try {
    const response = await registryApi.post("/package_releases/get", {
      package_id: packageData.package.package_id,
      is_latest: true,
    })
    releaseData = response.data
  } catch (e) {
    console.error(`Failed to fetch release data for ${fullName}:`, e)
    throw e
  }

  let filesData
  try {
    const response = await registryApi.post("/package_files/list", {
      package_release_id: releaseData.package_release.package_release_id,
    })
    filesData = response.data

    // Fetch content_text for each file individually
    for (const file of filesData.package_files) {
      try {
        const fileResponse = await registryApi.post("/package_files/get", {
          package_release_id: releaseData.package_release.package_release_id,
          file_path: file.file_path,
        })
        file.content_text = fileResponse.data.package_file.content_text
      } catch (e) {
        console.error(
          `Failed to fetch content for file ${file.file_path} in package ${fullName}:`,
          e,
        )
        throw e
      }
    }
  } catch (e) {
    console.error(`Failed to fetch files data for ${fullName}:`, e)
    throw e
  }

  return {
    package: packageData.package as Package,
    release: releaseData.package_release as PackageRelease,
    files: filesData.package_files as PackageFile[],
  }
}

const loadPackageWithDependencies = async (
  db: DbClient,
  owner: string,
  name: string,
  loadedPackages = new Set<string>(),
) => {
  const packageKey = `${owner}/${name}`
  if (loadedPackages.has(packageKey)) {
    return true
  }

  let result
  try {
    result = await fetchPackageFromRegistry(owner, name)
  } catch (e) {
    console.error(`✗ Failed to load ${packageKey}`)
    return false
  }

  const { package: pkg, release, files } = result

  // Check if package already exists
  if (db.getPackageById(pkg.package_id)) {
    console.log(`✓ Package ${packageKey} already exists`)
    return true
  }

  // Add package, release, and files to db
  db.addPackage({
    ...pkg,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_package_release_id: release.package_release_id,
  })

  db.addPackageRelease({
    ...release,
    created_at: new Date().toISOString(),
    transpilation_logs: Array.isArray(release.transpilation_logs) ? release.transpilation_logs : [],
    circuit_json_build_logs: Array.isArray(release.circuit_json_build_logs) ? release.circuit_json_build_logs : [],
    transpilation_display_status: release.transpilation_display_status ?? "pending",
  })

  for (const file of files) {
    db.addPackageFile({
      ...file,
      created_at: new Date().toISOString(),
    })
  }

  loadedPackages.add(packageKey)
  console.log(`✓ Loaded ${packageKey}`)

  // Load dependencies
  const mainFile = files.find(
    (f) => f.file_path === "index.tsx" || f.file_path === "index.ts",
  )
  if (!mainFile?.content_text) {
    return true
  }

  const dependencies = extractTsciDependencies(mainFile.content_text)
  let allDepsLoaded = true

  for (const dep of dependencies) {
    const depLoaded = await loadPackageWithDependencies(
      db,
      dep.owner,
      dep.name,
      loadedPackages,
    )
    if (!depLoaded) {
      allDepsLoaded = false
      console.warn(
        `⚠️ Failed to load dependency ${dep.owner}/${dep.name} for ${packageKey}`,
      )
    }
  }

  return allDepsLoaded
}

export const loadAutoloadPackages = async (db: DbClient) => {
  const autoloadPath = path.join(
    path.dirname(__dirname),
    "db",
    "autoload-packages.json",
  )
  if (!fs.existsSync(autoloadPath)) {
    console.error("No autoload-packages.json found")
    return
  }

  const autoloadContent = JSON.parse(fs.readFileSync(autoloadPath, "utf8"))
  const loadedPackages = new Set<string>()
  let successCount = 0
  let failureCount = 0

  for (const packageRef of autoloadContent.packages) {
    const success = await loadPackageWithDependencies(
      db,
      packageRef.owner,
      packageRef.name,
      loadedPackages,
    )
    if (success) {
      successCount++
    } else {
      failureCount++
    }
  }

  console.log(`\nPackage loading complete:`)
  console.log(`✓ Successfully loaded: ${successCount} packages`)
  if (failureCount > 0) {
    console.log(`✗ Failed to load: ${failureCount} packages`)
  }
}

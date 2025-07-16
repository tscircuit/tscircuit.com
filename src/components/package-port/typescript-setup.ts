import type { ATABootstrapConfig } from "@typescript/ata"
import { setupTypeAcquisition } from "@typescript/ata"
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs"
import { loadDefaultLibMap } from "@/lib/ts-lib-cache"
import tsModule from "typescript"
import type { PackageFile } from "@/types/package"

export const createFileSystemMap = (files: PackageFile[]) => {
  const fsMap = new Map<string, string>()
  files.forEach(({ path, content }) => {
    fsMap.set(`${path.startsWith("/") ? "" : "/"}${path}`, content)
  })
  ;(window as any).__DEBUG_CODE_EDITOR_FS_MAP = fsMap
  return fsMap
}

export const setupTypeScriptEnvironment = async (
  fsMap: Map<string, string>,
) => {
  const defaultFsMap = await loadDefaultLibMap()
  defaultFsMap.forEach((content, filename) => {
    fsMap.set(filename, content)
  })

  const system = createSystem(fsMap)
  const env = createVirtualTypeScriptEnvironment(system, [], tsModule, {
    jsx: tsModule.JsxEmit.ReactJSX,
    declaration: true,
    allowJs: true,
    target: tsModule.ScriptTarget.ES2022,
    resolveJsonModule: true,
  })

  // Add alias for tscircuit -> @tscircuit/core
  const tscircuitAliasDeclaration = `declare module "tscircuit" { export * from "@tscircuit/core"; }`
  env.createFile("tscircuit-alias.d.ts", tscircuitAliasDeclaration)

  return { system, env }
}

export const createATAConfig = (
  apiUrl: string,
  env: any,
  fsMap: Map<string, string>,
  lastReceivedTsFileTimeRef: React.RefObject<number>,
): ATABootstrapConfig => ({
  projectName: "my-project",
  typescript: tsModule,
  logger: console,
  fetcher: async (input: RequestInfo | URL, init?: RequestInit) => {
    const registryPrefixes = [
      "https://data.jsdelivr.com/v1/package/resolve/npm/@tsci/",
      "https://data.jsdelivr.com/v1/package/npm/@tsci/",
      "https://cdn.jsdelivr.net/npm/@tsci/",
    ]
    if (
      typeof input === "string" &&
      registryPrefixes.some((prefix) => input.startsWith(prefix))
    ) {
      const fullPackageName = input
        .replace(registryPrefixes[0], "")
        .replace(registryPrefixes[1], "")
        .replace(registryPrefixes[2], "")
      const packageName = fullPackageName.split("/")[0].replace(/\./, "/")
      const pathInPackage = fullPackageName.split("/").slice(1).join("/")
      const jsdelivrPath = `${packageName}${
        pathInPackage ? `/${pathInPackage}` : ""
      }`
      return fetch(
        `${apiUrl}/snippets/download?jsdelivr_resolve=${input.includes(
          "/resolve/",
        )}&jsdelivr_path=${encodeURIComponent(jsdelivrPath)}`,
      )
    }
    return fetch(input, init)
  },
  delegate: {
    started: () => {
      const manualEditsTypeDeclaration = `
			  declare module "manual-edits.json" {
			  const value: {
				  pcb_placements?: any[],
        schematic_placements?: any[],
				  edit_events?: any[],
				  manual_trace_hints?: any[],
			  } | undefined;
			  export default value;
			}
		`
      env.createFile("manual-edits.d.ts", manualEditsTypeDeclaration)
    },
    receivedFile: (code: string, path: string) => {
      fsMap.set(path, code)
      env.createFile(path, code)
      if (/\.tsx?$|\.d\.ts$/.test(path)) {
        ;(lastReceivedTsFileTimeRef as any).current = Date.now()
      }
      // Avoid dispatching a view update when ATA downloads files. Dispatching
      // here caused the editor to reset the user's selection, which made text
      // selection impossible while dependencies were loading.
    },
  },
})

export const initializeATA = (config: ATABootstrapConfig) => {
  return setupTypeAcquisition(config)
}

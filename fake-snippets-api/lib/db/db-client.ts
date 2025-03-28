import type { z } from "zod"
import { hoist } from "zustand-hoist"
import { createStore } from "zustand/vanilla"

import { combine } from "zustand/middleware"
import {
  type Account,
  type AccountPackage,
  JlcpcbOrderState,
  JlcpcbOrderStepRun,
  type LoginPage,
  type Order,
  type OrderFile,
  type Package,
  type PackageFile,
  type PackageRelease,
  type Session,
  type Snippet,
  databaseSchema,
  type packageSchema,
  type snippetSchema,
} from "./schema.ts"
import { seed as seedFn } from "./seed"

export const createDatabase = ({ seed }: { seed?: boolean } = {}) => {
  const db = hoist(createStore(initializer))
  if (seed) {
    seedFn(db)
  }
  return db
}

export type DbClient = ReturnType<typeof createDatabase>

const initializer = combine(databaseSchema.parse({}), (set, get) => ({
  addOrder: (order: Omit<Order, "order_id">): Order => {
    const newOrder = { order_id: `order_${get().idCounter + 1}`, ...order }
    set((state) => {
      return {
        orders: [...state.orders, newOrder],
        idCounter: state.idCounter + 1,
      }
    })
    return newOrder
  },
  getOrderById: (orderId: string): Order | undefined => {
    const state = get()
    return state.orders.find((order) => order.order_id === orderId)
  },
  getOrderFilesByOrderId: (orderId: string): OrderFile[] => {
    const state = get()
    return state.orderFiles.filter((file) => file.order_id === orderId)
  },
  getJlcpcbOrderStatesByOrderId: (
    orderId: string,
  ): JlcpcbOrderState | undefined => {
    const state = get()
    return state.jlcpcbOrderState.find((state) => state.order_id === orderId)
  },
  getJlcpcbOrderStepRunsByJlcpcbOrderStateId: (
    jlcpcbOrderStateId: string,
  ): JlcpcbOrderStepRun[] => {
    const state = get()
    return state.jlcpcbOrderStepRuns
      .filter((stepRun) => {
        const orderState = state.jlcpcbOrderState.find(
          (state) =>
            state.jlcpcb_order_state_id === stepRun.jlcpcb_order_state_id,
        )
        return orderState?.order_id === jlcpcbOrderStateId
      })
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
  },
  updateOrder: (orderId: string, updates: Partial<Order>) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.order_id === orderId ? { ...order, ...updates } : order,
      ),
    }))
  },
  addJlcpcbOrderState: (
    orderState: Omit<JlcpcbOrderState, "jlcpcb_order_state_id">,
  ): JlcpcbOrderState => {
    const newOrderState = {
      jlcpcb_order_state_id: `order_state_${get().idCounter + 1}`,
      ...orderState,
    }
    set((state) => {
      return {
        jlcpcbOrderState: [...state.jlcpcbOrderState, newOrderState],
        idCounter: state.idCounter + 1,
      }
    })
    return newOrderState
  },
  updateJlcpcbOrderState: (
    orderId: string,
    updates: Partial<JlcpcbOrderState>,
  ) => {
    set((state) => ({
      jlcpcbOrderState: state.jlcpcbOrderState.map((orderState) =>
        orderState.order_id === orderId
          ? { ...orderState, ...updates }
          : orderState,
      ),
    }))
  },
  addOrderFile: (orderFile: Omit<OrderFile, "order_file_id">): OrderFile => {
    const newOrderFile = {
      order_file_id: `order_file_${get().idCounter + 1}`,
      ...orderFile,
    }
    set((state) => {
      return {
        orderFiles: [...state.orderFiles, newOrderFile],
        idCounter: state.idCounter + 1,
      }
    })
    return newOrderFile
  },
  getOrderFileById: (orderFileId: string): OrderFile | undefined => {
    const state = get()
    return state.orderFiles.find((file) => file.order_file_id === orderFileId)
  },
  addAccount: (
    account: Omit<Account, "account_id"> & Partial<Pick<Account, "account_id">>,
  ) => {
    const newAccount = {
      account_id: account.account_id || `account_${get().idCounter + 1}`,
      ...account,
    }

    set((state) => {
      return {
        accounts: [...state.accounts, newAccount],
        idCounter: state.idCounter + 1,
      }
    })

    return newAccount
  },
  addAccountPackage: (
    accountPackage: Omit<AccountPackage, "account_package_id">,
  ): AccountPackage => {
    const newAccountPackage = {
      account_package_id: `ap_${get().idCounter + 1}`,
      ...accountPackage,
    }
    set((state) => {
      return {
        accountPackages: [...state.accountPackages, newAccountPackage],
        idCounter: state.idCounter + 1,
      }
    })
    return newAccountPackage
  },
  getAccountPackageById: (
    accountPackageId: string,
  ): AccountPackage | undefined => {
    const state = get()
    return state.accountPackages.find(
      (ap) => ap.account_package_id === accountPackageId,
    )
  },
  updateAccountPackage: (
    accountPackageId: string,
    updates: Partial<AccountPackage>,
  ): void => {
    set((state) => ({
      accountPackages: state.accountPackages.map((ap) =>
        ap.account_package_id === accountPackageId ? { ...ap, ...updates } : ap,
      ),
    }))
  },
  deleteAccountPackage: (accountPackageId: string): boolean => {
    let deleted = false
    set((state) => {
      const index = state.accountPackages.findIndex(
        (ap) => ap.account_package_id === accountPackageId,
      )
      if (index !== -1) {
        state.accountPackages.splice(index, 1)
        deleted = true
      }
      return state
    })
    return deleted
  },
  addSnippet: (
    snippet: Omit<
      z.input<typeof snippetSchema>,
      "snippet_id" | "package_release_id"
    >,
  ): Snippet => {
    const timestamp = Date.now()
    const currentTime = new Date(timestamp).toISOString()

    const newState = get()
    const nextId = newState.idCounter + 1

    // Create the package that will serve as our snippet
    const newPackage = {
      package_id: `pkg_${nextId}`,
      creator_account_id: snippet.owner_name, // Using owner_name as account_id since we don't have context
      owner_org_id: "", // Empty string instead of null to match type
      owner_github_username: snippet.owner_name,
      is_source_from_github: false,
      description: snippet.description || "",
      name: `${snippet.owner_name}/${snippet.unscoped_name}`,
      unscoped_name: snippet.unscoped_name,
      latest_version: "0.0.1",
      license: null,
      star_count: 0,
      created_at: currentTime,
      updated_at: currentTime,
      ai_description: null,
      is_snippet: true,
      is_board: snippet.snippet_type === "board",
      is_package: snippet.snippet_type === "package",
      is_model: snippet.snippet_type === "model",
      is_footprint: snippet.snippet_type === "footprint",
      snippet_type: snippet.snippet_type,
      is_private: false,
      is_public: true,
      is_unlisted: false,
      latest_package_release_id: `package_release_${nextId}`,
    }

    // Create package release
    const newPackageRelease = {
      package_release_id: `package_release_${nextId}`,
      package_id: newPackage.package_id,
      version: "0.0.1",
      is_latest: true,
      is_locked: false,
      created_at: currentTime,
      updated_at: currentTime,
    }

    // Add all the files
    const packageFiles: PackageFile[] = []
    let fileIdCounter = nextId

    // Add main code file
    packageFiles.push({
      package_file_id: `package_file_${fileIdCounter++}`,
      package_release_id: newPackageRelease.package_release_id,
      file_path: "index.tsx",
      content_text: snippet.code || "",
      created_at: currentTime,
    })

    // Add DTS file if provided
    if (snippet.dts) {
      packageFiles.push({
        package_file_id: `package_file_${fileIdCounter++}`,
        package_release_id: newPackageRelease.package_release_id,
        file_path: "/dist/index.d.ts",
        content_text: snippet.dts,
        created_at: currentTime,
      })
    }

    // Add compiled JS if provided
    if (snippet.compiled_js) {
      packageFiles.push({
        package_file_id: `package_file_${fileIdCounter++}`,
        package_release_id: newPackageRelease.package_release_id,
        file_path: "/dist/index.js",
        content_text: snippet.compiled_js,
        created_at: currentTime,
      })
    }

    // Add circuit JSON if provided
    if (snippet.circuit_json && snippet.circuit_json.length > 0) {
      packageFiles.push({
        package_file_id: `package_file_${fileIdCounter++}`,
        package_release_id: newPackageRelease.package_release_id,
        file_path: "/dist/circuit.json",
        content_text: JSON.stringify(snippet.circuit_json),
        created_at: currentTime,
      })
    }

    // Update the database state atomically
    set((state) => ({
      ...state,
      packages: [...state.packages, newPackage],
      packageReleases: [...state.packageReleases, newPackageRelease],
      packageFiles: [...state.packageFiles, ...packageFiles],
      idCounter: fileIdCounter,
    }))

    // Return in the same format as create endpoint
    return {
      snippet_id: newPackage.package_id,
      package_release_id: newPackageRelease.package_release_id,
      name: newPackage.name,
      unscoped_name: newPackage.unscoped_name,
      owner_name: snippet.owner_name,
      code: snippet.code || "",
      dts: snippet.dts,
      compiled_js: snippet.compiled_js,
      star_count: 0,
      created_at: currentTime,
      updated_at: currentTime,
      snippet_type: snippet.snippet_type,
      circuit_json: snippet.circuit_json || [],
      description: snippet.description || "",
      is_starred: false,
      version: "0.0.1",
      is_private: false,
      is_public: true,
      is_unlisted: false,
    }
  },
  getNewestSnippets: (limit: number): Snippet[] => {
    const state = get()

    // Get all packages that are snippets
    const snippetPackages = state.packages
      .filter((pkg) => pkg.is_snippet === true)
      .map((pkg) => {
        // Get the package release
        const packageRelease = state.packageReleases.find(
          (pr) =>
            pr.package_release_id === pkg.latest_package_release_id &&
            pr.is_latest === true,
        )
        if (!packageRelease) return null

        // Get the package files
        const packageFiles = state.packageFiles.filter(
          (file) =>
            file.package_release_id === packageRelease.package_release_id,
        )

        // Get the code file
        const codeFile = packageFiles.find(
          (file) =>
            file.file_path === "index.ts" || file.file_path === "index.tsx",
        )

        // Check if starred
        const isStarred = state.accountPackages.some(
          (ap) => ap.package_id === pkg.package_id && ap.is_starred,
        )

        // Convert to snippet format
        return {
          snippet_id: pkg.package_id,
          package_release_id: pkg.latest_package_release_id || "",
          unscoped_name: pkg.unscoped_name,
          name: pkg.name,
          owner_name: pkg.owner_github_username || "",
          description: pkg.description || "",
          snippet_type: pkg.snippet_type || "board",
          code: codeFile?.content_text || "",
          dts:
            packageFiles.find((file) => file.file_path === "/dist/index.d.ts")
              ?.content_text || "",
          compiled_js:
            packageFiles.find((file) => file.file_path === "/dist/index.js")
              ?.content_text || "",
          created_at: pkg.created_at,
          updated_at: pkg.updated_at,
          star_count: pkg.star_count || 0,
          is_starred: isStarred,
          version: pkg.latest_version || "0.0.1",
          circuit_json:
            packageFiles
              .filter((file) => file.file_path === "/dist/circuit.json")
              .flatMap((file) => JSON.parse(file.content_text || "[]")) || [],
          is_private: pkg.is_private || false,
          is_public: pkg.is_public || true,
          is_unlisted: pkg.is_unlisted || false,
        }
      })
      .filter(
        (snippet): snippet is NonNullable<typeof snippet> => snippet !== null,
      )
      .map((snippet) => ({
        ...snippet,
        description: snippet.description || "",
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, limit)

    return snippetPackages
  },
  getTrendingSnippets: (limit: number, since: string): Snippet[] => {
    const state = get()
    const sinceDate = new Date(since).getTime()

    // Get star counts within time period
    const recentStars = new Map<string, number>()
    state.accountPackages.forEach((ap) => {
      if (ap.is_starred && new Date(ap.created_at).getTime() >= sinceDate) {
        recentStars.set(
          ap.package_id,
          (recentStars.get(ap.package_id) || 0) + 1,
        )
      }
    })

    const packagesWithStarCount = [...state.packages]
      .map((pkg) => ({
        ...pkg,
        star_count: recentStars.get(pkg.package_id) || 0,
      }))
      .sort((a, b) => b.star_count - a.star_count)
      .slice(0, limit)

    const trendingSnippets = packagesWithStarCount
      .map((pkg) => {
        const packageRelease = state.packageReleases.find(
          (pr) =>
            pr.package_release_id === pkg.latest_package_release_id &&
            pr.is_latest === true,
        )
        if (!packageRelease) return null

        const packageFiles = state.packageFiles.filter(
          (file) =>
            file.package_release_id === packageRelease.package_release_id,
        )

        const codeFile = packageFiles.find(
          (file) =>
            file.file_path === "index.ts" || file.file_path === "index.tsx",
        )

        return {
          snippet_id: pkg.package_id,
          package_release_id: pkg.latest_package_release_id || "",
          unscoped_name: pkg.unscoped_name,
          name: pkg.name,
          owner_name: pkg.owner_github_username || "",
          code: codeFile ? codeFile.content_text || "" : "",
          created_at: pkg.created_at,
          updated_at: pkg.updated_at,
          snippet_type: pkg.is_snippet ? "board" : "package",
          star_count: pkg.star_count,
        }
      })
      .filter((snippet) => snippet !== null)

    return trendingSnippets as Snippet[]
  },
  getPackagesByAuthor: (authorName?: string): Package[] => {
    const state = get()
    const packages = authorName
      ? state.packages.filter((pkg) => pkg.owner_github_username === authorName)
      : state.packages
    return packages.map((pkg) => ({
      ...pkg,
      star_count: state.accountPackages.filter(
        (ap) => ap.package_id === pkg.package_id && ap.is_starred,
      ).length,
    }))
  },
  getSnippetByAuthorAndName: (
    authorName: string,
    snippetName: string,
  ): Snippet | undefined => {
    const state = get()
    // Look for the package that represents this snippet with case-insensitive matching
    const _package = state.packages.find(
      (pkg) =>
        pkg.owner_github_username?.toLowerCase() === authorName.toLowerCase() &&
        pkg.name.toLowerCase() === snippetName.toLowerCase() &&
        pkg.is_snippet === true,
    )
    if (!_package) return undefined

    // Get the package release
    const packageRelease = state.packageReleases.find(
      (pr) =>
        pr.package_release_id === _package.latest_package_release_id &&
        pr.is_latest === true,
    )
    if (!packageRelease) return undefined

    // Get the package files
    const packageFiles = state.packageFiles.filter(
      (file) => file.package_release_id === packageRelease.package_release_id,
    )

    // Get the code file (index.ts or index.tsx)
    const codeFile = packageFiles.find(
      (file) => file.file_path === "index.ts" || file.file_path === "index.tsx",
    )

    // Map the package data to match the Snippet structure
    return {
      snippet_id: _package.package_id,
      package_release_id: _package.latest_package_release_id || "",
      unscoped_name: _package.unscoped_name,
      name: _package.name,
      owner_name: _package.owner_github_username || "",
      description: _package.description || "",
      snippet_type: _package.snippet_type || "board",
      code: codeFile?.content_text || "",
      dts:
        packageFiles.find((file) => file.file_path === "/dist/index.d.ts")
          ?.content_text || "",
      compiled_js:
        packageFiles.find((file) => file.file_path === "/dist/index.js")
          ?.content_text || "",
      created_at: _package.created_at,
      updated_at: _package.updated_at,
      star_count: _package.star_count || 0,
      is_starred: false,
      version: _package.latest_version || "0.0.1",
      circuit_json: packageFiles.find(
        (file) => file.file_path === "/dist/circuit.json",
      )?.content_text
        ? JSON.parse(
            packageFiles.find((file) => file.file_path === "/dist/circuit.json")
              ?.content_text || "[]",
          )
        : [],
      is_private: _package.is_private || false,
      is_public: _package.is_public || true,
      is_unlisted: _package.is_unlisted || false,
    }
  },
  updateSnippet: (
    snippetId: string,
    updates: Partial<Snippet>,
  ): Snippet | undefined => {
    set((state) => {
      const packageIndex = state.packages.findIndex(
        (pkg) => pkg.package_id === snippetId && pkg.is_snippet === true,
      )
      if (packageIndex === -1) {
        return state
      }

      const timestamp = Date.now()
      const currentTime = new Date(timestamp).toISOString()

      // Update the package
      const updatedPackages = [...state.packages]
      const currentPackage = updatedPackages[packageIndex]
      updatedPackages[packageIndex] = {
        ...currentPackage,
        description: updates.description ?? currentPackage.description,
        is_private: updates.is_private ?? currentPackage.is_private,
        is_public:
          updates.is_private !== undefined
            ? !updates.is_private
            : currentPackage.is_public,
        is_unlisted: updates.is_private
          ? true
          : (updates.is_unlisted ?? currentPackage.is_unlisted),
        updated_at: currentTime,
      }

      // Get the current package release
      const packageRelease = state.packageReleases.find(
        (pr) =>
          pr.package_release_id === currentPackage.latest_package_release_id,
      )
      if (!packageRelease) return state

      // Update package files if code/dts/js changed
      const updatedFiles = [...state.packageFiles]
      const packageFiles = updatedFiles.filter(
        (file) => file.package_release_id === packageRelease.package_release_id,
      )

      if (updates.code !== undefined) {
        const codeFileIndex = packageFiles.findIndex(
          (file) =>
            file.file_path === "index.tsx" || file.file_path === "index.ts",
        )
        if (codeFileIndex >= 0) {
          updatedFiles[codeFileIndex] = {
            ...packageFiles[codeFileIndex],
            content_text: updates.code,
            created_at: currentTime,
          }
        } else {
          updatedFiles.push({
            package_file_id: `package_file_${timestamp}`,
            package_release_id: packageRelease.package_release_id,
            file_path: "index.tsx",
            content_text: updates.code,
            created_at: currentTime,
          })
        }
      }

      if (updates.dts !== undefined) {
        const dtsFileIndex = packageFiles.findIndex(
          (file) => file.file_path === "/dist/index.d.ts",
        )
        if (dtsFileIndex >= 0) {
          updatedFiles[dtsFileIndex] = {
            ...packageFiles[dtsFileIndex],
            content_text: updates.dts,
            created_at: currentTime,
          }
        } else {
          updatedFiles.push({
            package_file_id: `package_file_${timestamp}`,
            package_release_id: packageRelease.package_release_id,
            file_path: "/dist/index.d.ts",
            content_text: updates.dts,
            created_at: currentTime,
          })
        }
      }

      if (updates.compiled_js !== undefined) {
        const jsFileIndex = packageFiles.findIndex(
          (file) => file.file_path === "/dist/index.js",
        )
        if (jsFileIndex >= 0) {
          updatedFiles[jsFileIndex] = {
            ...packageFiles[jsFileIndex],
            content_text: updates.compiled_js,
            created_at: currentTime,
          }
        } else {
          updatedFiles.push({
            package_file_id: `package_file_${timestamp}`,
            package_release_id: packageRelease.package_release_id,
            file_path: "/dist/index.js",
            content_text: updates.compiled_js,
            created_at: currentTime,
          })
        }
      }

      // Update circuit JSON if provided
      if (updates.circuit_json !== undefined) {
        const circuitFileIndex = packageFiles.findIndex(
          (file) => file.file_path === "/dist/circuit.json",
        )
        if (circuitFileIndex >= 0) {
          updatedFiles[circuitFileIndex] = {
            ...packageFiles[circuitFileIndex],
            content_text: JSON.stringify(updates.circuit_json),
            created_at: new Date().toISOString(),
          }
        }
      }

      // Return updated state
      return {
        ...state,
        packages: updatedPackages,
        packageFiles: updatedFiles,
      }
    })

    // Get the updated snippet to return
    const updatedPackage = get().packages.find(
      (pkg) => pkg.package_id === snippetId,
    )
    if (!updatedPackage) return undefined

    const packageRelease = get().packageReleases.find(
      (pr) =>
        pr.package_release_id === updatedPackage.latest_package_release_id,
    )
    if (!packageRelease) return undefined

    const packageFiles = get().packageFiles.filter(
      (file) => file.package_release_id === packageRelease.package_release_id,
    )

    const codeFile = packageFiles.find(
      (file) => file.file_path === "index.ts" || file.file_path === "index.tsx",
    )
    const dtsFile = packageFiles.find(
      (file) => file.file_path === "/dist/index.d.ts",
    )
    const jsFile = packageFiles.find(
      (file) => file.file_path === "/dist/index.js",
    )
    const circuitFile = packageFiles.find(
      (file) => file.file_path === "/dist/circuit.json",
    )

    // Return in snippet format
    return {
      snippet_id: updatedPackage.package_id,
      package_release_id: updatedPackage.latest_package_release_id || "",
      unscoped_name: updatedPackage.unscoped_name,
      name: updatedPackage.name,
      owner_name: updatedPackage.owner_github_username || "",
      description: updatedPackage.description || "",
      snippet_type: updatedPackage.snippet_type || "board",
      code: codeFile?.content_text || "",
      dts: dtsFile?.content_text || "",
      compiled_js: jsFile?.content_text || "",
      created_at: updatedPackage.created_at,
      updated_at: updatedPackage.updated_at,
      star_count: updatedPackage.star_count || 0,
      is_starred: false,
      version: updatedPackage.latest_version || "0.0.1",
      circuit_json: circuitFile
        ? JSON.parse(circuitFile.content_text || "[]")
        : [],
      is_private: updatedPackage.is_private ?? false,
      is_public: updatedPackage.is_public ?? true,
      is_unlisted: updatedPackage.is_unlisted ?? false,
    }
  },
  getSnippetById: (
    snippetId: string,
    auth?: { github_username: string },
  ): Snippet | undefined => {
    const state = get()
    // Look for the package that represents this snippet
    const _package = state.packages.find(
      (pkg) => pkg.package_id === snippetId && pkg.is_snippet === true,
    )
    if (!_package) return undefined

    // Handle visibility based on authentication
    if (!auth) {
      // Unauthenticated users can only see public and non-unlisted packages
      if (!_package.is_public || _package.is_unlisted) {
        return undefined
      }
    } else {
      // Authenticated users can see:
      // 1. Public and non-unlisted packages
      // 2. Their own unlisted packages
      // 3. Their own private packages
      const isOwnPackage =
        _package.owner_github_username === auth?.github_username
      const isPublicAndNotUnlisted = _package.is_public && !_package.is_unlisted
      const isOwnUnlisted = _package.is_unlisted && isOwnPackage
      const isOwnPrivate = _package.is_private && isOwnPackage

      if (!isPublicAndNotUnlisted && !isOwnUnlisted && !isOwnPrivate) {
        return undefined
      }
    }

    // Get the package release
    const packageRelease = state.packageReleases.find(
      (pr) =>
        pr.package_release_id === _package.latest_package_release_id &&
        pr.is_latest === true,
    )
    if (!packageRelease) return undefined

    // Get the package files
    const packageFiles = state.packageFiles.filter(
      (file) => file.package_release_id === packageRelease.package_release_id,
    )

    // Get the code file (index.ts or index.tsx)
    const codeFile = packageFiles.find(
      (file) => file.file_path === "index.ts" || file.file_path === "index.tsx",
    )

    // Check if the current user has starred this snippet
    const isStarred = state.accountPackages.some(
      (ap) => ap.package_id === snippetId && ap.is_starred,
    )

    // Map the package data to match the Snippet structure
    return {
      snippet_id: _package.package_id,
      package_release_id: _package.latest_package_release_id || "",
      unscoped_name: _package.unscoped_name,
      name: _package.name,
      owner_name: _package.owner_github_username || "",
      description: _package.description || "",
      snippet_type: _package.snippet_type || "board",
      code: codeFile?.content_text || "",
      dts:
        packageFiles.find((file) => file.file_path === "/dist/index.d.ts")
          ?.content_text || "",
      compiled_js:
        packageFiles.find((file) => file.file_path === "/dist/index.js")
          ?.content_text || "",
      created_at: _package.created_at,
      updated_at: _package.updated_at,
      star_count: _package.star_count || 0,
      is_starred: isStarred,
      version: _package.latest_version || "0.0.1",
      circuit_json: packageFiles.find(
        (file) => file.file_path === "/dist/circuit.json",
      )?.content_text
        ? JSON.parse(
            packageFiles.find((file) => file.file_path === "/dist/circuit.json")
              ?.content_text || "[]",
          )
        : [],
      is_private: _package.is_private || false,
      is_public: _package.is_public || true,
      is_unlisted: _package.is_unlisted || false,
    }
  },
  searchSnippets: (query: string): Snippet[] => {
    const state = get()
    const lowercaseQuery = query.toLowerCase()

    // Get all packages that are snippets
    const packages = state.packages.filter((pkg) => pkg.is_snippet === true)

    // Find packages that match by name or description
    const matchingPackagesByMetadata = packages.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(lowercaseQuery) ||
        pkg.description?.toLowerCase().includes(lowercaseQuery),
    )

    // Find packages that match by code content in any file
    const matchingFilesByContent = state.packageFiles.filter(
      (file) =>
        file.content_text?.toLowerCase().includes(lowercaseQuery) ?? false,
    )

    // Get the packages for matching files
    const matchingPackagesByContent = matchingFilesByContent
      .map((file) => {
        // Find the package release for this file
        const packageRelease = state.packageReleases.find(
          (pr) => pr.package_release_id === file.package_release_id,
        )
        if (!packageRelease) return null

        // Find the package for this release
        return packages.find(
          (pkg) =>
            pkg.latest_package_release_id === packageRelease.package_release_id,
        )
      })
      .filter((pkg): pkg is NonNullable<typeof pkg> => pkg !== null)

    // Combine both sets of matching packages and remove duplicates
    const matchingPackages = [
      ...new Set([...matchingPackagesByMetadata, ...matchingPackagesByContent]),
    ]

    // Convert matching packages to snippet format
    return matchingPackages
      .map((pkg) => {
        const packageRelease = state.packageReleases.find(
          (pr) =>
            pr.package_release_id === pkg.latest_package_release_id &&
            pr.is_latest === true,
        )
        if (!packageRelease) return null

        const packageFiles = state.packageFiles.filter(
          (file) =>
            file.package_release_id === packageRelease.package_release_id,
        )

        const codeFile = packageFiles.find(
          (file) =>
            file.file_path === "index.ts" || file.file_path === "index.tsx",
        )

        const isStarred = state.accountPackages.some(
          (ap) => ap.package_id === pkg.package_id && ap.is_starred,
        )

        return {
          snippet_id: pkg.package_id,
          package_release_id: pkg.latest_package_release_id || "",
          unscoped_name: pkg.unscoped_name,
          name: pkg.name,
          owner_name: pkg.owner_github_username || "",
          description: pkg.description || "",
          snippet_type: pkg.snippet_type || "board",
          code: codeFile?.content_text || "",
          dts:
            packageFiles.find((file) => file.file_path === "/dist/index.d.ts")
              ?.content_text || "",
          compiled_js:
            packageFiles.find((file) => file.file_path === "/dist/index.js")
              ?.content_text || "",
          created_at: pkg.created_at,
          updated_at: pkg.updated_at,
          star_count: pkg.star_count || 0,
          is_starred: isStarred,
          version: pkg.latest_version || "0.0.1",
          circuit_json:
            packageFiles
              .filter((file) => file.file_path === "/dist/circuit.json")
              .flatMap((file) => JSON.parse(file.content_text || "[]")) || [],
        } as Snippet
      })
      .filter((snippet): snippet is Snippet => snippet !== null)
  },
  deleteSnippet: (snippetId: string): boolean => {
    let deleted = false
    set((state) => {
      const index = state.snippets.findIndex((s) => s.snippet_id === snippetId)
      if (index !== -1) {
        state.snippets.splice(index, 1)
        deleted = true
      }
      return state
    })
    return deleted
  },
  addSession: (session: Omit<Session, "session_id">): Session => {
    const newSession = { session_id: `session_${Date.now()}`, ...session }
    set((state) => ({
      sessions: [...state.sessions, newSession],
    }))
    return newSession
  },
  getSessions: ({
    account_id,
    is_cli_session,
  }: { account_id: string; is_cli_session?: boolean }): Session[] => {
    const state = get()
    return state.sessions.filter(
      (session) =>
        session.account_id === account_id &&
        (is_cli_session === undefined ||
          session.is_cli_session === is_cli_session),
    )
  },
  createLoginPage: (): LoginPage => {
    const newLoginPage: LoginPage = {
      login_page_id: `login_page_${Date.now()}`,
      login_page_auth_token: `token_${Date.now()}`,
      was_login_successful: false,
      has_been_used_to_create_session: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes expiration
    }
    set((state) => ({
      loginPages: [...state.loginPages, newLoginPage],
    }))
    return newLoginPage
  },
  getLoginPage: (loginPageId: string): LoginPage | undefined => {
    const state = get()
    return state.loginPages.find((lp) => lp.login_page_id === loginPageId)
  },
  updateLoginPage: (loginPageId: string, updates: Partial<LoginPage>): void => {
    set((state) => ({
      loginPages: state.loginPages.map((lp) =>
        lp.login_page_id === loginPageId ? { ...lp, ...updates } : lp,
      ),
    }))
  },
  getAccount: (accountId: string): Account | undefined => {
    const state = get()
    return state.accounts.find((account) => account.account_id === accountId)
  },
  updateAccount: (
    accountId: string,
    updates: Partial<Account>,
  ): Account | undefined => {
    let updatedAccount: Account | undefined
    set((state) => {
      const accountIndex = state.accounts.findIndex(
        (account) => account.account_id === accountId,
      )
      if (accountIndex !== -1) {
        updatedAccount = { ...state.accounts[accountIndex] }
        if (updates.shippingInfo) {
          updatedAccount.shippingInfo = {
            ...updatedAccount.shippingInfo,
            ...updates.shippingInfo,
          }
          delete updates.shippingInfo
        }
        updatedAccount = { ...updatedAccount, ...updates }
        const updatedAccounts = [...state.accounts]
        updatedAccounts[accountIndex] = updatedAccount
        return { ...state, accounts: updatedAccounts }
      }
      return state
    })
    return updatedAccount
  },
  createSession: (session: Omit<Session, "session_id">): Session => {
    const newSession = { session_id: `session_${Date.now()}`, ...session }
    set((state) => ({
      sessions: [...state.sessions, newSession],
    }))
    return newSession
  },
  addStar: (accountId: string, packageId: string): AccountPackage => {
    const now = new Date().toISOString()
    const accountPackage = {
      account_package_id: `ap_${Date.now()}`,
      account_id: accountId,
      package_id: packageId,
      is_starred: true,
      created_at: now,
      updated_at: now,
    }

    // Update the package's star count
    set((state) => {
      // Find the package and increment its star count
      const packageIndex = state.packages.findIndex(
        (pkg) => pkg.package_id === packageId,
      )
      if (packageIndex >= 0) {
        const updatedPackages = [...state.packages]
        updatedPackages[packageIndex] = {
          ...updatedPackages[packageIndex],
          star_count: (updatedPackages[packageIndex].star_count || 0) + 1,
        }

        return {
          packages: updatedPackages,
          accountPackages: [...state.accountPackages, accountPackage],
        }
      }

      return {
        accountPackages: [...state.accountPackages, accountPackage],
      }
    })

    return accountPackage
  },
  removeStar: (accountId: string, packageId: string): void => {
    set((state) => {
      // Find the package and decrement its star count
      const packageIndex = state.packages.findIndex(
        (pkg) => pkg.package_id === packageId,
      )

      if (packageIndex >= 0) {
        const updatedPackages = [...state.packages]
        updatedPackages[packageIndex] = {
          ...updatedPackages[packageIndex],
          star_count: Math.max(
            0,
            (updatedPackages[packageIndex].star_count || 0) - 1,
          ),
        }

        return {
          packages: updatedPackages,
          accountPackages: state.accountPackages.filter(
            (ap) =>
              !(ap.account_id === accountId && ap.package_id === packageId),
          ),
        }
      }

      return {
        accountPackages: state.accountPackages.filter(
          (ap) => !(ap.account_id === accountId && ap.package_id === packageId),
        ),
      }
    })
  },
  hasStarred: (accountId: string, packageId: string): boolean => {
    const state = get()
    return state.accountPackages.some(
      (ap) =>
        ap.account_id === accountId &&
        ap.package_id === packageId &&
        ap.is_starred,
    )
  },
  addPackage: (
    _package: Omit<z.input<typeof packageSchema>, "package_id">,
  ): Package => {
    const timestamp = Date.now()
    const newPackage = {
      package_id: `package_${timestamp}`,
      ..._package,
    }
    set((state) => ({
      packages: [...state.packages, newPackage as Package],
    }))
    return newPackage as Package
  },
  updatePackage: (
    packageId: string,
    updates: Partial<Package>,
  ): Package | undefined => {
    let updatedPackage: Package | undefined
    set((state) => {
      const packageIndex = state.packages.findIndex(
        (pkg) => pkg.package_id === packageId,
      )
      if (packageIndex === -1) return state

      const updatedPackages = [...state.packages]
      updatedPackages[packageIndex] = {
        ...updatedPackages[packageIndex],
        ...updates,
      }
      updatedPackage = updatedPackages[packageIndex]
      return { ...state, packages: updatedPackages }
    })
    return updatedPackage
  },
  getPackageById: (packageId: string): Package | undefined => {
    const state = get()
    const pkg = state.packages.find((pkg) => pkg.package_id === packageId)
    if (!pkg) return undefined
    return {
      ...pkg,
    }
  },
  getPackageReleaseById: (
    packageReleaseId: string,
  ): PackageRelease | undefined => {
    const state = get()
    return state.packageReleases.find(
      (pr) => pr.package_release_id === packageReleaseId,
    )
  },
  addPackageRelease: (
    packageRelease: Omit<PackageRelease, "package_release_id">,
  ): PackageRelease => {
    const newPackageRelease = {
      package_release_id: `package_release_${Date.now()}`,
      ...packageRelease,
    }
    set((state) => ({
      packageReleases: [...state.packageReleases, newPackageRelease],
    }))
    return newPackageRelease
  },
  updatePackageRelease: (packageRelease: PackageRelease): void => {
    set((state) => ({
      packageReleases: state.packageReleases.map((pr) =>
        pr.package_release_id === packageRelease.package_release_id
          ? packageRelease
          : pr,
      ),
    }))
  },
  addPackageFile: (
    packageFile: Omit<PackageFile, "package_file_id">,
  ): PackageFile => {
    const newPackageFile = {
      package_file_id: `package_file_${Date.now()}`,
      ...packageFile,
    }
    set((state) => ({
      packageFiles: [...state.packageFiles, newPackageFile],
    }))
    return newPackageFile
  },
  getStarCount: (packageId: string): number => {
    const state = get()
    return state.accountPackages.filter(
      (ap) => ap.package_id === packageId && ap.is_starred,
    ).length
  },
  getPackageFilesByReleaseId: (packageReleaseId: string): PackageFile[] => {
    const state = get()
    return state.packageFiles.filter(
      (pf) => pf.package_release_id === packageReleaseId,
    )
  },
}))

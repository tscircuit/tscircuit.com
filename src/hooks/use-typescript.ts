import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

type TypescriptModule = any

// Global state to prevent multiple script loads
let tsModuleGlobal: TypescriptModule | null = null
let tsPromiseGlobal: Promise<TypescriptModule> | null = null

/**
 * Dynamically loads TypeScript from CDN
 */
const loadTypescript = (): Promise<TypescriptModule> => {
  // If already loaded, return the module
  if (tsModuleGlobal) {
    return Promise.resolve(tsModuleGlobal)
  }

  // If already loading, return the existing promise
  if (tsPromiseGlobal) {
    return tsPromiseGlobal
  }

  // Create a new promise to load the script
  const toastId = toast.loading("Loading TypeScript...")
  tsPromiseGlobal = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src =
      "https://cdn.jsdelivr.net/npm/typescript@5.6.3/lib/typescript.min.js"
    script.async = true

    script.onload = () => {
      // Script has loaded, store the module and resolve
      toast.success("TypeScript loaded", { id: toastId })
      tsModuleGlobal = (window as any).ts
      resolve(tsModuleGlobal)
    }

    script.onerror = () => {
      toast.error("Failed to load TypeScript from CDN", { id: toastId })
      reject(new Error("Failed to load TypeScript from CDN"))
    }

    document.head.appendChild(script)
  })

  return tsPromiseGlobal
}

/**
 * Hook to access the TypeScript module loaded from CDN
 * @returns Object containing isLoading state and the TypeScript module when loaded
 */
export const useTypescript = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [tsModule, setTsModule] = useState<TypescriptModule | null>(null)

  useEffect(() => {
    // If already available globally, use it
    if (tsModuleGlobal) {
      setTsModule(tsModuleGlobal)
      setIsLoading(false)
      return
    }

    // Otherwise, load it
    loadTypescript()
      .then((ts) => {
        setTsModule(ts)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load TypeScript:", error)
        setIsLoading(false)
      })
  }, [])

  return { isLoading, tsModule }
}

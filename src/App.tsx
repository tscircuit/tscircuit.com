import { ComponentType, Suspense, lazy, useEffect } from "react" // Added `useEffect` for handling skeleton cleanup
import { Toaster } from "@/components/ui/toaster"
import { Route, Switch } from "wouter"
import "./components/CmdKMenu"
import { ContextProviders } from "./ContextProviders"
import React from "react"

// Lazy loading helper
const lazyImport = (importFn: () => Promise<any>) =>
  lazy<ComponentType<any>>(async () => {
    try {
      const module = await importFn()
      if (module.default) {
        return { default: module.default }
      }
      const pageExportNames = ["Page", "Component", "View"]
      for (const suffix of pageExportNames) {
        const keys = Object.keys(module).filter((key) => key.endsWith(suffix))
        if (keys.length > 0) {
          return { default: module[keys[0]] }
        }
      }
      const componentExport = Object.values(module).find(
        (exp) => typeof exp === "function" && exp.prototype?.isReactComponent,
      )
      if (componentExport) {
        return { default: componentExport }
      }
      throw new Error(
        `No valid React component found in module. Available exports: ${Object.keys(module).join(", ")}`,
      )
    } catch (error) {
      console.error("Failed to load component:", error)
      throw error
    }
  })

// Lazy-loaded pages
const AiPage = lazyImport(() => import("@/pages/ai"))
const AuthenticatePage = lazyImport(() => import("@/pages/authorize"))
const DashboardPage = lazyImport(() => import("@/pages/dashboard"))
const EditorPage = lazyImport(async () => {
  const [editorModule] = await Promise.all([
    import("@/pages/editor"),
    import("@/lib/utils/load-prettier").then((m) => m.loadPrettier()),
  ])
  return editorModule
})
const LandingPage = lazyImport(() => import("@/pages/landing"))
const MyOrdersPage = lazyImport(() => import("@/pages/my-orders"))
const NewestPage = lazyImport(() => import("@/pages/newest"))
const PreviewPage = lazyImport(() => import("@/pages/preview"))
const QuickstartPage = lazyImport(() => import("@/pages/quickstart"))
const SearchPage = lazyImport(() => import("@/pages/search"))
const SettingsPage = lazyImport(() => import("@/pages/settings"))
const UserProfilePage = lazyImport(() => import("@/pages/user-profile"))
const ViewOrderPage = lazyImport(() => import("@/pages/view-order"))
const ViewSnippetPage = lazyImport(() => import("@/pages/view-snippet"))
const DevLoginPage = lazyImport(() => import("@/pages/dev-login"))

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong loading the page.</div>
    }
    return this.props.children
  }
}

function App() {
  // Added useEffect to handle cleanup of the skeleton loader
  useEffect(() => {
    // Hide the skeleton from index.html when React mounts
    const skeletonLoader = document.getElementById("skeleton-loader")
    if (skeletonLoader) {
      skeletonLoader.style.display = "none"
    }
  }, [])

  return (
    <ContextProviders>
      <ErrorBoundary>
        <Suspense fallback={<h5 id="skeleton-loader" />}>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/editor" component={EditorPage} />
            <Route path="/quickstart" component={QuickstartPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/ai" component={AiPage} />
            <Route path="/newest" component={NewestPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/search" component={SearchPage} />
            <Route path="/authorize" component={AuthenticatePage} />
            <Route path="/my-orders" component={MyOrdersPage} />
            <Route path="/orders/:orderId" component={ViewOrderPage} />
            <Route path="/preview" component={PreviewPage} />
            <Route path="/dev-login" component={DevLoginPage} />
            <Route path="/:username" component={UserProfilePage} />
            <Route path="/:author/:snippetName" component={ViewSnippetPage} />
          </Switch>
        </Suspense>
        <Toaster />
      </ErrorBoundary>
    </ContextProviders>
  )
}

export default App

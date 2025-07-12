import { ComponentType, Suspense, lazy } from "react"
import { Route, Switch } from "wouter"
import "./components/CmdKMenu"
import { ContextProviders } from "./ContextProviders"
import React from "react"

const FullPageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="w-48">
      <div className="loading">
        <div className="loading-bar"></div>
      </div>
    </div>
  </div>
)

const lazyImport = (importFn: () => Promise<any>) =>
  lazy<ComponentType<any>>(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
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
const LatestPage = lazyImport(() => import("@/pages/latest"))
const QuickstartPage = lazyImport(() => import("@/pages/quickstart"))
const SearchPage = lazyImport(() => import("@/pages/search"))
const SettingsPage = lazyImport(() => import("@/pages/settings"))
const UserProfilePage = lazyImport(() => import("@/pages/user-profile"))
const DevLoginPage = lazyImport(() => import("@/pages/dev-login"))
const ViewPackagePage = lazyImport(() => import("@/pages/view-package"))
const PackageBuildsPage = lazyImport(() => import("@/pages/package-builds"))
const TrendingPage = lazyImport(() => import("@/pages/trending"))
const DatasheetPage = lazyImport(() => import("@/pages/datasheet"))
const DatasheetsPage = lazyImport(() => import("@/pages/datasheets"))
const PackageEditorPage = lazyImport(async () => {
  const [editorModule] = await Promise.all([
    import("@/pages/package-editor"),
    import("@/lib/utils/load-prettier").then((m) => m.loadPrettier()),
  ])
  return editorModule
})

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; reloading: boolean }
> {
  private visibilityHandler?: () => void
  private reloadTimeout?: number

  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, reloading: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true, reloading: false }
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught", error)
    const message = error.message || ""
    if (
      /(Loading chunk|ChunkLoadError|dynamically imported module)/i.test(
        message,
      )
    ) {
      const loadedAt = window.__APP_LOADED_AT || Date.now()
      if (Date.now() - loadedAt >= 10_000) {
        this.performReload()
      }
    }
  }

  componentDidUpdate(_prevProps: any, prevState: any) {
    if (!prevState.hasError && this.state.hasError && !this.state.reloading) {
      this.setupIdleReload()
    }
  }

  componentWillUnmount() {
    this.cleanup()
  }

  cleanup = () => {
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler)
      window.removeEventListener("focus", this.visibilityHandler)
      this.visibilityHandler = undefined
    }
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout)
      this.reloadTimeout = undefined
    }
  }

  performReload = () => {
    if (this.state.reloading) return // Prevent multiple reloads

    this.cleanup() // Clean up listeners before reload
    this.setState({ reloading: true })
    this.reloadTimeout = window.setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  setupIdleReload = () => {
    this.cleanup() // Clean up any existing handlers

    this.visibilityHandler = () => {
      if (
        document.visibilityState === "visible" &&
        this.state.hasError &&
        !this.state.reloading
      ) {
        this.performReload()
      }
    }

    document.addEventListener("visibilitychange", this.visibilityHandler)
    window.addEventListener("focus", this.visibilityHandler)

    // In case the tab is already visible when the error occurs
    this.visibilityHandler()
  }

  render() {
    if (this.state.reloading) {
      return <div>There was a problem loading this page. Reloading…</div>
    }
    if (this.state.hasError) {
      return <div>Something went wrong loading the page.</div>
    }
    return this.props.children
  }
}

function App() {
  return (
    <ContextProviders>
      <ErrorBoundary>
        <Suspense fallback={<FullPageLoader />}>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route
              path="/view-package/:author/:packageName"
              component={ViewPackagePage}
            />
            <Route path="/editor" component={PackageEditorPage} />
            <Route path="/legacy-editor" component={EditorPage} />
            <Route path="/quickstart" component={QuickstartPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/latest" component={LatestPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/search" component={SearchPage} />
            <Route path="/trending" component={TrendingPage} />
            <Route path="/datasheets" component={DatasheetsPage} />
            <Route path="/datasheets/:chipName" component={DatasheetPage} />
            <Route path="/authorize" component={AuthenticatePage} />
            <Route path="/my-orders" component={MyOrdersPage} />
            <Route path="/dev-login" component={DevLoginPage} />
            <Route path="/:username" component={UserProfilePage} />
            <Route path="/:author/:packageName" component={ViewPackagePage} />
            <Route
              path="/:author/:packageName/builds"
              component={PackageBuildsPage}
            />
            <Route component={lazyImport(() => import("@/pages/404"))} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
    </ContextProviders>
  )
}

export default App

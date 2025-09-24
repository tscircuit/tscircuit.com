import { ComponentType, Suspense, lazy } from "react"
import { Route, Switch } from "wouter"
import "./components/CmdKMenu"
import { ContextProviders } from "./ContextProviders"
import React from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Loader2 } from "lucide-react"

export const FullPageLoader = () => (
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
const CreateOrganizationPage = lazyImport(
  () => import("@/pages/create-organization"),
)
const ProfileRouter = lazyImport(() => import("@/components/ProfileRouter"))
const DevLoginPage = lazyImport(() => import("@/pages/dev-login"))
const ViewPackagePage = lazyImport(() => import("@/pages/view-package"))
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
const ReleasesPage = lazyImport(() => import("@/pages/releases"))
const ReleaseDetailPage = lazyImport(() => import("@/pages/release-detail"))
const ReleaseBuildsPage = lazyImport(() => import("@/pages/release-builds"))
const ReleasePreviewPage = lazyImport(() => import("@/pages/preview-release"))
const OrganizationSettingsPage = lazyImport(
  () => import("@/pages/organization-settings"),
)

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
      if (Date.now() - loadedAt >= 180_000) {
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
      if (window?.location.href.includes("localhost:")) return
      if (window?.location.href.includes("127.0.0.1:")) return
      window.location.reload()
    }, 500)
  }

  setupIdleReload = () => {
    this.cleanup() // Clean up any existing handlers

    this.visibilityHandler = () => {
      const loadedAt = window.__APP_LOADED_AT || Date.now()
      if (
        document.visibilityState === "visible" &&
        this.state.hasError &&
        !this.state.reloading &&
        Date.now() - loadedAt >= 180_000
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
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Reloading Page
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We encountered an issue and are refreshing the page for you.
              </p>
            </div>
          </div>
        </div>
      )
    }
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-lg w-full text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full mb-6">
                <svg
                  className="w-10 h-10 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We're experiencing technical difficulties. The page will
                automatically reload when you return to this tab.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={this.performReload}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <ReloadIcon className="w-4 h-4 mr-2" />
                Reload Now
              </button>
            </div>
          </div>
        </div>
      )
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
            <Route path="/search" component={SearchPage} />
            <Route path="/trending" component={TrendingPage} />
            <Route path="/datasheets" component={DatasheetsPage} />
            <Route path="/datasheets/:chipName" component={DatasheetPage} />
            <Route path="/authorize" component={AuthenticatePage} />
            <Route path="/my-orders" component={MyOrdersPage} />
            <Route path="/dev-login" component={DevLoginPage} />

            {/* Organization creation route */}
            <Route path="/orgs/new" component={CreateOrganizationPage} />

            {/* Organization settings route */}
            <Route
              path="/:orgname/settings"
              component={OrganizationSettingsPage}
            />

            {/* Profile fallback route - handles both organizations and users */}
            <Route path="/:username" component={ProfileRouter} />

            {/* Package-related routes - must come after profile fallback */}
            <Route
              path="/:author/:packageName/releases/:releaseId/builds"
              component={ReleaseBuildsPage}
            />
            <Route
              path="/:author/:packageName/releases/:releaseId"
              component={ReleaseDetailPage}
            />
            <Route
              path="/:author/:packageName/releases/:packageReleaseId/preview"
              component={ReleasePreviewPage}
            />
            <Route
              path="/:author/:packageName/releases/:packageReleaseId"
              component={ReleaseDetailPage}
            />
            <Route
              path="/:author/:packageName/releases"
              component={ReleasesPage}
            />
            <Route path="/:author/:packageName" component={ViewPackagePage} />
            {/* 404 fallback */}
            <Route component={lazyImport(() => import("@/pages/404"))} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
    </ContextProviders>
  )
}

export default App

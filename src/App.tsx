import { ComponentType, Suspense, lazy } from "react"
import { Toaster } from "@/components/ui/toaster"
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
const LatestPage = lazyImport(() => import("@/pages/latest"))
const PreviewPage = lazyImport(() => import("@/pages/preview"))
const QuickstartPage = lazyImport(() => import("@/pages/quickstart"))
const SearchPage = lazyImport(() => import("@/pages/search"))
const SettingsPage = lazyImport(() => import("@/pages/settings"))
const UserProfilePage = lazyImport(() => import("@/pages/user-profile"))
const ViewOrderPage = lazyImport(() => import("@/pages/view-order"))
const ViewSnippetPage = lazyImport(() => import("@/pages/view-snippet"))
const DevLoginPage = lazyImport(() => import("@/pages/dev-login"))
const BetaPage = lazyImport(() => import("@/pages/beta"))
const ViewPackagePage = lazyImport(() => import("@/pages/view-package"))
const TrendingPage = lazyImport(() => import("@/pages/trending"))

// Wip Package Port Routes
const PackageEditorPage = lazyImport(async () => {
  const [editorModule] = await Promise.all([
    import("@/pages/p/editor"),
    import("@/lib/utils/load-prettier").then((m) => m.loadPrettier()),
  ])
  return editorModule
})
const PackageUserProfilePage = lazyImport(
  () => import("@/pages/p/user-profile"),
)
const PackageViewPage = lazyImport(() => import("@/pages/p/view-package"))

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
  return (
    <ContextProviders>
      <ErrorBoundary>
        <Suspense fallback={<FullPageLoader />}>
          <Switch>
            {/* Package Wip Routes  */}
            <Route path="/p/editor" component={PackageEditorPage} />
            <Route path="/p/:username" component={PackageUserProfilePage} />
            <Route path="/p/:author/:packageName" component={PackageViewPage} />

            <Route path="/" component={LandingPage} />
            <Route path="/beta" component={BetaPage} />
            <Route path="/beta/:author/:packageName" component={BetaPage} />
            <Route
              path="/view-package/:author/:packageName"
              component={ViewPackagePage}
            />
            <Route path="/editor" component={EditorPage} />
            <Route path="/quickstart" component={QuickstartPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/ai" component={AiPage} />
            <Route path="/latest" component={LatestPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/search" component={SearchPage} />
            <Route path="/trending" component={TrendingPage} />
            <Route path="/authorize" component={AuthenticatePage} />
            <Route path="/my-orders" component={MyOrdersPage} />
            <Route path="/orders/:orderId" component={ViewOrderPage} />
            <Route path="/preview" component={PreviewPage} />
            <Route path="/dev-login" component={DevLoginPage} />
            <Route path="/:username" component={UserProfilePage} />
            <Route path="/:author/:packageName" component={ViewPackagePage} />
            <Route
              path="/snippets/:author/:snippetName"
              component={ViewSnippetPage}
            />
            <Route component={lazyImport(() => import("@/pages/404"))} />
          </Switch>
        </Suspense>
        <Toaster />
      </ErrorBoundary>
    </ContextProviders>
  )
}

export default App

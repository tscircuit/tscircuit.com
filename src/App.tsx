import { ComponentType, Suspense, lazy } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Route, Switch } from "wouter"
import "./components/CmdKMenu"
import { ContextProviders } from "./ContextProviders"

const lazyImport = (importFn: () => Promise<any>) =>
  lazy<ComponentType<any>>(() =>
    importFn().then((module) => ({
      default: module.default || module.AuthorizePage || module,
    })),
  )

const AiPage = lazyImport(() => import("@/pages/ai"))
const AuthenticatePage = lazyImport(() => import("@/pages/authorize"))
const DashboardPage = lazyImport(() => import("@/pages/dashboard"))
const EditorPage = lazyImport(() => import("@/pages/editor"))
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

function App() {
  return (
    <ContextProviders>
      <Suspense fallback={<div>Loading...</div>}>
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
    </ContextProviders>
  )
}

export default App

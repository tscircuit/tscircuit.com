import { ComponentType, Suspense, lazy } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Route, Switch } from "wouter"
import "./components/CmdKMenu"
import { ContextProviders } from "./ContextProviders"

const lazyImport = (path: string) => 
  lazy<ComponentType<any>>(() => 
    import(path).then(module => ({ default: module.default || module.AuthorizePage || module }))
  )

const AiPage = lazyImport("./pages/ai")
const AuthenticatePage = lazyImport("./pages/authorize") 
const DashboardPage = lazyImport("./pages/dashboard")
const EditorPage = lazyImport("./pages/editor")
const LandingPage = lazyImport("./pages/landing")
const MyOrdersPage = lazyImport("./pages/my-orders")
const NewestPage = lazyImport("./pages/newest")
const PreviewPage = lazyImport("./pages/preview")
const QuickstartPage = lazyImport("./pages/quickstart")
const SearchPage = lazyImport("./pages/search")
const SettingsPage = lazyImport("./pages/settings")
const UserProfilePage = lazyImport("./pages/user-profile")
const ViewOrderPage = lazyImport("./pages/view-order")
const ViewSnippetPage = lazyImport("./pages/view-snippet")
const DevLoginPage = lazyImport("./pages/dev-login")

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

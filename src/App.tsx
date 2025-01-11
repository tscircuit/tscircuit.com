import { Toaster } from "@/components/ui/toaster"
import { Route, Routes } from "react-router-dom"
import "./components/CmdKMenu"
import { ContextProviders } from "./ContextProviders"
import { AiPage } from "./pages/ai"
import AuthenticatePage from "./pages/authorize"
import { DashboardPage } from "./pages/dashboard"
import { EditorPage } from "./pages/editor"
import { LandingPage } from "./pages/landing"
import { MyOrdersPage } from "./pages/my-orders"
import { NewestPage } from "./pages/newest"
import { PreviewPage } from "./pages/preview"
import { QuickstartPage } from "./pages/quickstart"
import { SearchPage } from "./pages/search"
import { SettingsPage } from "./pages/settings"
import { UserProfilePage } from "./pages/user-profile"
import { ViewOrderPage } from "./pages/view-order"
import { ViewSnippetPage } from "./pages/view-snippet"
import { DevLoginPage } from "./pages/dev-login"

function App() {
  return (
    <ContextProviders>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/quickstart" element={<QuickstartPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ai" element={<AiPage />} />
        <Route path="/newest" element={<NewestPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/authorize" element={<AuthenticatePage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/orders/:orderId" element={<ViewOrderPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/dev-login" element={<DevLoginPage />} />
        <Route path="/:username" element={<UserProfilePage />} />
        <Route path="/:author/:snippetName" element={<ViewSnippetPage />} />
      </Routes>
      <Toaster />
    </ContextProviders>
  )
}

export default App

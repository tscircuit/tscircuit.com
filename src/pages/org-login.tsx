import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useState, type ReactNode } from "react"
import { LogIn, Github, Globe } from "lucide-react"

type OrgAuthProvider = "google" | "github"

const providerCards: Array<{
  id: OrgAuthProvider
  label: string
  description: string
  icon: ReactNode
}> = [
  {
    id: "google",
    label: "Continue with Google",
    description: "Use your Google Workspace identity",
    icon: <Globe className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "github",
    label: "Continue with GitHub",
    description: "Use your GitHub organization account",
    icon: <Github className="h-5 w-5 text-gray-900" />,
  },
]

const ProviderButton = ({
  provider,
  isActive,
  onClick,
}: {
  provider: (typeof providerCards)[number]
  isActive: boolean
  onClick: (id: OrgAuthProvider) => void
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(provider.id)}
      className={`w-full text-left border rounded-xl px-4 py-3 transition-all ${isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-white shadow-sm">{provider.icon}</div>
        <div>
          <div className="font-semibold">{provider.label}</div>
          <div className="text-sm text-gray-500">{provider.description}</div>
        </div>
        <LogIn className="ml-auto h-4 w-4 text-gray-400" />
      </div>
    </button>
  )
}

const OrgLoginContent = () => {
  const [selectedProvider, setSelectedProvider] =
    useState<OrgAuthProvider | null>(null)

  const handleProviderClick = (provider: OrgAuthProvider) => {
    setSelectedProvider(provider)
    // Actual auth redirect handled in Phase 4
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-3xl">
        <div className="grid gap-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
            <div>
              <p className="text-sm uppercase text-blue-500 font-semibold">
                Organization Access
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                Sign in with your company identity
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Pick the provider that matches your company’s setup and we’ll sign you in.
              </p>
            </div>
            <div className="space-y-3">
              {providerCards.map((provider) => (
                <ProviderButton
                  key={provider.id}
                  provider={provider}
                  isActive={selectedProvider === provider.id}
                  onClick={handleProviderClick}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              By continuing you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export const OrgLoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <OrgLoginContent />
      <Footer />
    </div>
  )
}

export default OrgLoginPage

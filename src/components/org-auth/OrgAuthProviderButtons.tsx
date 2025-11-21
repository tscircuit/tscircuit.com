import { type ReactNode, useState } from "react"
import { LogIn, Github, Globe } from "lucide-react"
import { useOrgSignIn, type OrgAuthProvider } from "@/hooks/use-org-sign-in"

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
        <div className="p-2 rounded-full bg-white shadow-sm">
          {provider.icon}
        </div>
        <div>
          <div className="font-semibold">{provider.label}</div>
          <div className="text-sm text-gray-500">{provider.description}</div>
        </div>
        <LogIn className="ml-auto h-4 w-4 text-gray-400" />
      </div>
    </button>
  )
}

interface OrgAuthProviderButtonsProps {
  onProviderSelect?: (provider: OrgAuthProvider) => void
  redirectPath?: string
}

export const OrgAuthProviderButtons = ({
  onProviderSelect,
  redirectPath,
}: OrgAuthProviderButtonsProps) => {
  const [selectedProvider, setSelectedProvider] =
    useState<OrgAuthProvider | null>(null)
  const orgSignIn = useOrgSignIn()

  const handleProviderClick = (provider: OrgAuthProvider) => {
    setSelectedProvider(provider)
    onProviderSelect?.(provider)
    orgSignIn(provider, redirectPath)
  }

  return (
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
  )
}

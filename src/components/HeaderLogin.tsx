import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Building2, Check } from "lucide-react"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useAccountBalance } from "@/hooks/use-account-balance"
import { useSignIn } from "@/hooks/use-sign-in"
import { useOrganizations } from "@/hooks/use-organizations"
import { PrefetchPageLink } from "./PrefetchPageLink"
import { useMemo, useState } from "react"

type AccountContext = {
  username: string
  type: "personal" | "organization"
}

export const HeaderLogin = () => {
  const session = useGlobalStore((s) => s.session)
  const isLoggedIn = Boolean(session)
  const setSession = useGlobalStore((s) => s.setSession)
  const signIn = useSignIn()
  const { data: accountBalance } = useAccountBalance()
  const { organizations } = useOrganizations()
  const [currentAccount, setCurrentAccount] = useState<AccountContext>({
    type: "personal",
    username: session?.github_username || "user",
  })

  // Build available accounts list
  const availableAccounts: AccountContext[] = useMemo(() => {
    const accounts: AccountContext[] = []

    // Add personal account
    if (session?.github_username) {
      accounts.push({
        type: "personal",
        username: session.github_username,
      })
    }

    // Mock orgs
    organizations.forEach((org) => {
      accounts.push({
        type: "organization",
        username: org.github_handle,
      })
    })

    return accounts
  }, [session, organizations])

  const handleAccountChange = (account: AccountContext) => {
    setCurrentAccount(account)
    console.log("Switched to account:", account)
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center md:space-x-2 justify-end">
        <Button onClick={() => signIn()} variant="ghost">
          Log In
        </Button>
        <Button onClick={() => signIn()}>Get Started</Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-8 h-8 login-avatar">
          <AvatarImage
            src={`https://github.com/${currentAccount?.username}.png`}
            alt={`${currentAccount?.username}'s profile picture`}
          />
          <AvatarFallback aria-label="User avatar fallback">
            <User size={16} aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 ml-1 mr-1 md:ml-0 md:mr-1">
        {/* AI Usage */}
        <DropdownMenuItem asChild className="text-gray-500 text-xs" disabled>
          <div>
            AI Usage $
            {accountBalance?.monthly_ai_budget_used_usd.toFixed(2) ?? "0.00"} /
            $5.00
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Account Switcher */}
        {availableAccounts.length > 1 && (
          <>
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Switch Account
              </p>
            </div>

            {availableAccounts.map((account) => (
              <DropdownMenuItem
                key={`${account.type}-${account.username}`}
                onClick={() => handleAccountChange(account)}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={`https://github.com/${currentAccount.username}.png`}
                    alt={`${account.username} avatar`}
                  />
                  <AvatarFallback className="text-xs">
                    {account.username
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {account.username}
                    </span>
                    {account.type === "organization" ? (
                      <Building2 className="h-3 w-3 text-gray-400" />
                    ) : (
                      <User className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    @{account.username}
                  </p>
                </div>

                {currentAccount.username === account.username &&
                  currentAccount.type === account.type && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
          </>
        )}

        {/* Profile Links */}
        <DropdownMenuItem asChild>
          <a href={`/${currentAccount.username}`} className="cursor-pointer">
            {currentAccount.type === "organization"
              ? "Organization Profile"
              : "My Profile"}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/dashboard" className="cursor-pointer">
            Dashboard
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings" className="cursor-pointer">
            Settings
          </a>
        </DropdownMenuItem>
        {isLoggedIn && (
          <>
            <DropdownMenuItem className="flex items-center cursor-pointer">
              <PrefetchPageLink href="/orgs/new">
                Create Organization
              </PrefetchPageLink>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild onClick={() => setSession(null)}>
          <a href="/" className="cursor-pointer">
            Sign Out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useAccountBalance } from "@/hooks/use-account-balance"
import { useSignIn } from "@/hooks/use-sign-in"

export const HeaderLogin = () => {
  const session = useGlobalStore((s) => s.session)
  const isLoggedIn = Boolean(session)
  const setSession = useGlobalStore((s) => s.setSession)
  const signIn = useSignIn()
  const { data: accountBalance } = useAccountBalance()

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
            src={`https://github.com/${session?.github_username}.png`}
            alt={`${session?.github_username}'s profile picture`}
          />
          <AvatarFallback aria-label="User avatar fallback">
            <User size={16} aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ml-1 mr-1 md:ml-0 md:mr-1">
        <DropdownMenuItem asChild className="text-gray-500 text-xs" disabled>
          <div>
            AI Usage $
            {accountBalance?.monthly_ai_budget_used_usd.toFixed(2) ?? "0.00"} /
            $5.00
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/${session?.github_username}`} className="cursor-pointer">
            My Profile
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
        <DropdownMenuItem asChild onClick={() => setSession(null)}>
          <a href="/" className="cursor-pointer">
            Sign Out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
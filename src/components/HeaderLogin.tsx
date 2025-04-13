import React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocation } from "wouter"
import { User } from "lucide-react"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useAccountBalance } from "@/hooks/use-account-balance"
import { useSignIn } from "@/hooks/use-sign-in"

interface HeaderLoginProps {}

export const HeaderLogin: React.FC<HeaderLoginProps> = () => {
  const [, setLocation] = useLocation()
  const session = useGlobalStore((s) => s.session)
  const isLoggedIn = Boolean(session)
  const setSession = useGlobalStore((s) => s.setSession)
  const signIn = useSignIn()
  const { data: accountBalance } = useAccountBalance()

  if (!isLoggedIn) {
    return (
      <div className="flex items-center md:space-x-2 justify-end">
        <Button onClick={() => signIn()} variant="ghost">
          Log in
        </Button>
        <Button onClick={() => signIn()}>Sign up</Button>
      </div>
    )
  }

  return (
    <div className="flex justify-end items-center">
      <DropdownMenu>
        <DropdownMenuTrigger>
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
        <DropdownMenuContent>
          <DropdownMenuItem className="text-gray-500 text-xs" disabled>
            AI Usage $
            {accountBalance?.monthly_ai_budget_used_usd.toFixed(2) ?? "0.00"} /
            $5.00
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLocation(`/${session?.github_username}`)}
          >
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/my-orders")}>
            My Orders
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/settings")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSession(null)}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

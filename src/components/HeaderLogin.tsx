import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, useLocation, useRouter } from "wouter"
import { User } from "lucide-react"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useAccountBalance } from "@/hooks/use-account-balance"

export const HeaderLogin: React.FC = () => {
  const [, setLocation] = useLocation()
  const session = useGlobalStore((s) => s.session)
  const isLoggedIn = Boolean(session)
  const setSession = useGlobalStore((s) => s.setSession)
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const { data: accountBalance } = useAccountBalance()

  if (!isLoggedIn) {
    return (
      <div className="flex items-center space-x-2 justify-end">
        <Button
          onClick={() => {
            if (snippetsBaseApiUrl) {
              window.location.href = `${snippetsBaseApiUrl}/internal/oauth/github/authorize?next=${window.location.origin}/authorize`
            } else {
              setSession({})
            }
          }}
          variant="ghost"
          size="sm"
        >
          Login
        </Button>
        <Button
          size="sm"
          onClick={() => {
            if (snippetsBaseApiUrl) {
              window.location.href = `${snippetsBaseApiUrl}/internal/oauth/github/authorize?next=${window.location.origin}/authorize`
            } else {
              setSession({})
            }
          }}
        >
          Sign Up
        </Button>
      </div>
    )
  }

  return (
    <div className="flex justify-end items-center">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={`https://github.com/${session?.github_username}.png`}
            />
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="text-gray-500 text-xs" disabled>
            AI Usage $
            {accountBalance?.monthly_ai_budget_used_usd.toFixed(2) ?? "0.00"} /
            $5.00
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
            Dashboard
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

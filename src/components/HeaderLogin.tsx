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
import { useSignIn } from "@/hooks/use-sign-in"
import { Link } from "wouter"
import { useState } from "react"
import { useAxios } from "@/hooks/use-axios"

export const HeaderLogin = () => {
  const session = useGlobalStore((s) => s.session)
  const isLoggedIn = Boolean(session)
  const setSession = useGlobalStore((s) => s.setSession)
  const signIn = useSignIn()
  const [isOpen, setIsOpen] = useState(false)
  const axios = useAxios()

  const handleSignOut = async () => {
    try {
      await axios.post("/sessions/delete")
    } catch (error) {
      console.error("Error deleting session from backend:", error)
    } finally {
      setSession(null)
      setIsOpen(false)
    }
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Avatar className="w-8 h-8 login-avatar">
            <AvatarImage
              src={`https://github.com/${session?.github_username}.png?size=40`}
              alt={`${session?.github_username}'s profile picture`}
            />
            <AvatarFallback aria-label="User avatar fallback">
              <User size={16} aria-hidden="true" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ml-1 mr-1 md:ml-0 md:mr-1">
        {/* <DropdownMenuItem asChild className="text-gray-500 text-xs" disabled>
          <div>
            AI Usage $
            {accountBalance?.monthly_ai_budget_used_usd.toFixed(2) ?? "0.00"} /
            $5.00
          </div>
        </DropdownMenuItem> */}
        <DropdownMenuItem asChild>
          <Link
            href={`/${session?.github_username}`}
            className="cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${session?.github_username}/settings`}
            className="cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/orgs/new"
            className="cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Create Organization
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/"
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              handleSignOut()
            }}
          >
            Sign Out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

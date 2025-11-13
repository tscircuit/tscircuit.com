import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useSignIn } from "@/hooks/use-sign-in"
import { Link } from "wouter"
import { useState } from "react"
import { useAxios } from "@/hooks/use-axios"
import { GithubAvatarWithFallback } from "@/components/GithubAvatarWithFallback"

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
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full w-fit focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <GithubAvatarWithFallback
              username={session?.github_username}
              className="w-8 h-8 focus:outline-none focus:ring-0 !ring-0"
              size={40}
              colorClassName="text-black"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="ml-1 mr-1 md:ml-0 md:mr-1"
          side="bottom"
          align="end"
          sideOffset={4}
        >
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
              href={`/settings`}
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
    </>
  )
}

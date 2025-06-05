import { HeaderLogin } from "@/components/HeaderLogin"
import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/hooks/use-global-store"
import { cn } from "@/lib/utils"
import {
  GitHubLogoIcon,
  DiscordLogoIcon,
} from "@radix-ui/react-icons"
import { Menu, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useLocation } from "wouter"
import { PrefetchPageLink } from "./PrefetchPageLink"
import CmdKMenu from "./CmdKMenu"
import HeaderDropdown from "./HeaderDropdown"
import SearchComponent from "./SearchComponent"
import { Analytics } from "./Analytics"

const HeaderButton = ({
  href,
  children,
  className,
  alsoHighlightForUrl,
}: {
  href: string
  children: React.ReactNode
  className?: string
  alsoHighlightForUrl?: string
}) => {
  const [location] = useLocation()

  if (location === href || location === alsoHighlightForUrl) {
    return (
      <PrefetchPageLink className={cn("header-button", className)} href={href}>
        <Button
          variant="ghost"
          className={`border-b-2 rounded-none border-blue-600 header-button ${className}`}
        >
          {children}
        </Button>
      </PrefetchPageLink>
    )
  }

  return (
    <PrefetchPageLink className={cn("header-button", className)} href={href}>
      <Button className={className} variant="ghost">
        {children}
      </Button>
    </PrefetchPageLink>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const sessionToken = useGlobalStore((s) => s.session?.token)

  useEffect(() => {
    window.TSCIRCUIT_REGISTRY_TOKEN = sessionToken ?? ""
  },[])

  return (
    <header className="px-4 py-3">
      <div className="flex items-center">
        <PrefetchPageLink
          href="/"
          className="text-lg font-semibold whitespace-nowrap"
        >
          <span className="bg-blue-500 px-2 py-1 rounded-md text-white">
            tscircuit
          </span>
        </PrefetchPageLink>
        <div className="hidden md:flex items-center space-x-4">
          <nav>
            <ul className="flex items-center gap-2 ml-2">
              {isLoggedIn && (
                <li>
                  <HeaderButton href="/dashboard">Dashboard</HeaderButton>
                </li>
              )}
              <li>
                <HeaderButton href="/quickstart" alsoHighlightForUrl="/editor">
                  Editor
                </HeaderButton>
              </li>
              <li>
                <a href="https://chat.tscircuit.com">
                  <Button variant="ghost">AI</Button>
                </a>
              </li>
              <li>
                <a href="https://docs.tscircuit.com">
                  <Button variant="ghost">Docs</Button>
                </a>
              </li>
              <li>
                <a
                  href="https://tscircuit.com/join"
                  target="_blank"
                  className="mr-2"
                >
                  <Button variant="ghost">
                    <DiscordLogoIcon className="text-gray-400 hover:text-gray-600 transition-colors w-4 h-4" />
                  </Button>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex-grow"></div>
        <a
          href="https://github.com/tscircuit/tscircuit"
          target="_blank"
          className="mr-4"
          aria-label="View TSCircuit on GitHub"
        >
          <GitHubLogoIcon className="text-gray-400 hover:text-gray-600 transition-colors" />
        </a>
        {/* <a href="https://tscircuit.com/join" target="_blank" className="mr-2">
          <DiscordLogoIcon className="text-gray-400 hover:text-gray-600 transition-colors" />
        </a> */}
        <div className="hidden md:flex items-center space-x-4">
          <SearchComponent />
          <HeaderDropdown />
          <HeaderLogin />
        </div>
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden mt-4">
          <nav className="mb-4">
            <ul className="flex flex-col gap-2 w-full">
              {isLoggedIn && (
                <li>
                  <HeaderButton
                    className="w-full justify-start"
                    href="/dashboard"
                  >
                    Dashboard
                  </HeaderButton>
                </li>
              )}
              <li>
                <HeaderButton
                  className="w-full justify-start"
                  href="/quickstart"
                  alsoHighlightForUrl="/editor"
                >
                  Editor
                </HeaderButton>
              </li>
              <li>
                <HeaderButton
                  className="w-full justify-start"
                  href="https://chat.tscircuit.com"
                >
                  AI
                </HeaderButton>
              </li>
              <li>
                <HeaderButton
                  className="w-full justify-start"
                  href="https://docs.tscircuit.com"
                >
                  Docs
                </HeaderButton>
              </li>
            </ul>
          </nav>
          <div className="flex flex-col gap-4">
            <SearchComponent />
            <HeaderDropdown />
            <HeaderLogin />
          </div>
        </div>
      )}
      <CmdKMenu />
      <Analytics />
    </header>
  )
}

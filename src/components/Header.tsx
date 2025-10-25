import { HeaderLogin } from "@/components/HeaderLogin"
import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/hooks/use-global-store"
import { cn } from "@/lib/utils"
import { GitHubLogoIcon, DiscordLogoIcon } from "@radix-ui/react-icons"
import { Menu, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useLocation } from "wouter"
import { Link } from "wouter"
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
  const isExternal = /^(https?|mailto|tel):\/?\//i.test(href)
  if (isExternal) {
    return (
      <a
        className={cn("header-button", className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className={className} variant="ghost">
          {children}
        </Button>
      </a>
    )
  }

  // For internal links, use the Link Component
  if (location === href || location === alsoHighlightForUrl) {
    return (
      <Link className={cn("header-button", className)} href={href}>
        <Button
          variant="ghost"
          className={`border-b-2 rounded-none border-blue-600 header-button ${className}`}
        >
          {children}
        </Button>
      </Link>
    )
  }

  return (
    <Link className={cn("header-button", className)} href={href}>
      <Button className={className} variant="ghost">
        {children}
      </Button>
    </Link>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const sessionToken = useGlobalStore((s) => s.session?.token)

  useEffect(() => {
    window.TSCIRCUIT_REGISTRY_TOKEN = sessionToken ?? ""
  }, [sessionToken])

  return (
    <header className="px-4 py-3">
      <div className="flex items-center">
        <Link
          href="/"
          className="text-lg font-semibold whitespace-nowrap select-none"
        >
          <span className="bg-blue-500 px-2 py-1 rounded-md text-white">
            tscircuit
          </span>
        </Link>
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
            </ul>
          </nav>
        </div>
        <div className="flex-grow"></div>
        <a
          href="https://tscircuit.com/join"
          target="_blank"
          className="lg:mr-4"
        >
          <DiscordLogoIcon className="text-gray-400 hidden lg:block hover:text-gray-600 transition-colors w-4 h-4" />
        </a>
        <a
          href="https://github.com/tscircuit/tscircuit"
          target="_blank"
          className="lg:mr-4"
          aria-label="View TSCircuit on GitHub"
        >
          <GitHubLogoIcon className="hidden lg:block text-gray-400 hover:text-gray-600 transition-colors" />
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
              <li>
                <HeaderButton className="w-full justify-start" href="/search">
                  Search
                </HeaderButton>
              </li>
            </ul>
          </nav>
          <div className="flex flex-col gap-4">
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

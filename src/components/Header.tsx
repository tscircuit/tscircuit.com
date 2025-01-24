import { HeaderLogin } from "@/components/HeaderLogin"
import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/hooks/use-global-store"
import { cn } from "@/lib/utils"
import {
  GitHubLogoIcon,
  OpenInNewWindowIcon,
  ChatBubbleIcon,
  DiscordLogoIcon,
} from "@radix-ui/react-icons"
import { Menu, X } from "lucide-react"
import React, { useState } from "react"
import { useLocation } from "wouter"
import { PrefetchPageLink } from "./PrefetchPageLink"
import CmdKMenu from "./CmdKMenu"
import HeaderDropdown from "./HeaderDropdown"
import SearchComponent from "./SearchComponent"
import { Analytics } from "./Analytics"
import ToggleMode from "./ToggleMode"

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
          className={`border-b-2 dark:text-slate-200 rounded-none border-blue-600 header-button ${className} dark:border-blue-400`}
        >
          {children}
        </Button>
      </PrefetchPageLink>
    )
  }

  return (
    <PrefetchPageLink className={cn("header-button", className)} href={href}>
      <Button className={`${className} dark:text-gray-300`} variant="ghost">
        {children}
      </Button>
    </PrefetchPageLink>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))

  return (
    <header className="px-4 py-3 dark:bg-gray-950">
      <div className="flex items-center">
        <PrefetchPageLink
          href="/"
          className="text-lg font-semibold whitespace-nowrap"
        >
          <span className="px-2 py-1 text-white bg-blue-500 rounded-md dark:bg-blue-700">
            tscircuit
          </span>
        </PrefetchPageLink>
        <div className="items-center hidden space-x-4 md:flex">
          <nav>
            <ul className="flex items-center gap-2 ml-2">
              {isLoggedIn && (
                <li>
                  <HeaderButton href="/dashboard">Dashboard</HeaderButton>
                </li>
              )}
              <li>
                <HeaderButton href="/newest">Newest</HeaderButton>
              </li>
              <li>
                <HeaderButton href="/quickstart" alsoHighlightForUrl="/editor">
                  Editor
                </HeaderButton>
              </li>
              <li>
                <HeaderButton href="/ai">AI</HeaderButton>
              </li>
              <li>
                <a href="https://docs.tscircuit.com">
                  <Button className="dark:text-slate-100" variant="ghost">
                    Docs
                  </Button>
                </a>
              </li>
              <li>
                <a
                  href="https://tscircuit.com/join"
                  target="_blank"
                  className="mr-2"
                >
                  <Button variant="ghost">
                    <DiscordLogoIcon className="w-4 h-4 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-500" />
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
          <GitHubLogoIcon className="text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-500" />
        </a>
        {/* <a href="https://tscircuit.com/join" target="_blank" className="mr-2">
          <DiscordLogoIcon className="text-gray-400 transition-colors hover:text-gray-600" />
        </a> */}
        <div className="items-center hidden space-x-4 md:flex">
          <ToggleMode />
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
        <div className="mt-4 md:hidden">
          <nav className="mb-4">
            <ul className="flex flex-col w-full gap-2">
              {isLoggedIn && (
                <li>
                  <HeaderButton
                    className="justify-start w-full"
                    href="/dashboard"
                  >
                    Dashboard
                  </HeaderButton>
                </li>
              )}
              <li>
                <HeaderButton className="justify-start w-full" href="/newest">
                  Newest
                </HeaderButton>
              </li>
              <li>
                <HeaderButton
                  className="justify-start w-full"
                  href="/quickstart"
                  alsoHighlightForUrl="/editor"
                >
                  Editor
                </HeaderButton>
              </li>
              <li>
                <HeaderButton className="justify-start w-full" href="/ai">
                  AI
                </HeaderButton>
              </li>
              <li>
                <HeaderButton
                  className="justify-start w-full"
                  href="https://docs.tscircuit.com"
                >
                  Docs
                </HeaderButton>
              </li>
            </ul>
          </nav>
          <div className="flex flex-col gap-4">
            <ToggleMode />
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

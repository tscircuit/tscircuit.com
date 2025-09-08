import { Button } from "@/components/ui/button"
import { CircuitBoard, Search, Menu, X } from "lucide-react"
import { Link } from "wouter"
import { PrefetchPageLink } from "./PrefetchPageLink"
import { HeaderLogin } from "./HeaderLogin"
import SearchComponent from "./SearchComponent"
import HeaderDropdown from "./HeaderDropdown"
import { useState } from "react"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Analytics } from "./Analytics"
import CmdKMenu from "./CmdKMenu"

const SearchButtonComponent = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="relative">
      {isExpanded ? (
        <div className="flex items-center gap-2 ml-8">
          <div className="absolute -top-4 right-3 bg-white">
            <SearchComponent
              autofocus
              closeOnClick={() => {
                setIsExpanded(false)
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(true)}
            className="h-8 w-8 hidden sm:flex"
            aria-label="Open search"
          >
            <Search className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (window.location.href = "/search")}
            className="h-8 w-8 flex sm:hidden"
            aria-label="Go to search"
          >
            <Search className="size-4" />
          </Button>
        </>
      )}
    </div>
  )
}

export const Header2 = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLoggedIn = useGlobalStore((state) => Boolean(state.session))

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white md:bg-white/80 md:backdrop-blur supports-[backdrop-filter]:md:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-2 md:px-6">
          <PrefetchPageLink
            href="/"
            className="flex select-none items-center gap-2"
          >
            <CircuitBoard className="h-6 w-6" />
            <span className="text-lg font-bold">tscircuit</span>
          </PrefetchPageLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            {isLoggedIn && (
              <PrefetchPageLink
                className="text-sm font-medium hover:underline underline-offset-4"
                href="/dashboard"
              >
                Dashboard
              </PrefetchPageLink>
            )}
            <PrefetchPageLink
              className="text-sm font-medium hover:underline underline-offset-4"
              href="/quickstart"
            >
              Editor
            </PrefetchPageLink>
            <a
              className="text-sm font-medium hover:underline underline-offset-4"
              href="https://docs.tscircuit.com"
            >
              Docs
            </a>
            <a
              className="text-sm font-medium hover:underline underline-offset-4"
              href="https://tscircuit.com/join"
            >
              Discord
            </a>
            <a
              className="text-sm font-medium hover:underline underline-offset-4"
              href="mailto:hello@tscircuit.com"
            >
              Contact
            </a>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <SearchButtonComponent />
            {isLoggedIn && <HeaderDropdown />}
            <HeaderLogin />
          </div>

          {/* Mobile Right Side */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/search")}
              className="h-8 w-8"
              aria-label="Go to search"
            >
              <Search className="size-4" />
            </Button>
            {isLoggedIn ? (
              <HeaderLogin />
            ) : (
              <PrefetchPageLink href="/quickstart">
                <Button size="sm" className="text-xs px-3 py-1">
                  Get Started
                </Button>
              </PrefetchPageLink>
            )}
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white ">
            <div className="container mx-auto px-4 py-3">
              <nav className="mb-4">
                <div className="flex flex-col items-center gap-1">
                  {isLoggedIn && (
                    <PrefetchPageLink
                      className="text-sm font-medium hover:underline underline-offset-4 py-2 w-full text-center"
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </PrefetchPageLink>
                  )}
                  <PrefetchPageLink
                    className="text-sm font-medium hover:underline underline-offset-4 py-2 w-full text-center"
                    href="/quickstart"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Editor
                  </PrefetchPageLink>
                  <a
                    className="text-sm font-medium hover:underline underline-offset-4 py-2 w-full text-center"
                    href="https://docs.tscircuit.com"
                  >
                    Docs
                  </a>
                  <a
                    className="text-sm font-medium hover:underline underline-offset-4 py-2 w-full text-center"
                    href="https://tscircuit.com/join"
                  >
                    Discord
                  </a>
                  <a
                    className="text-sm font-medium hover:underline underline-offset-4 py-2 w-full text-center"
                    href="mailto:hello@tscircuit.com"
                  >
                    Contact
                  </a>
                </div>
              </nav>
              <div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-200">
                {isLoggedIn ? (
                  <div className="w-full flex justify-center">
                    <HeaderDropdown />
                  </div>
                ) : (
                  <div className="w-full flex justify-center">
                    <HeaderLogin />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <CmdKMenu />
      <Analytics />
    </>
  )
}

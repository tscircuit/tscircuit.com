import { Button } from "@/components/ui/button"
import { Search, Menu, X } from "lucide-react"
import { Link } from "wouter"
import { HeaderLogin } from "./HeaderLogin"
import SearchComponent from "./SearchComponent"
import HeaderDropdown from "./HeaderDropdown"
import { useState } from "react"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Analytics } from "./Analytics"
import CmdKMenu from "./CmdKMenu"
import { HeaderNavigation } from "./HeaderNavigation"

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
        <div className="container mx-auto flex h-[70px] items-center justify-between px-2 md:px-6">
          <a href="/" className="flex select-none items-center">
            <span className="bg-[#4b8bf4] px-2 py-1 rounded-md text-white text-base font-medium">
              tscircuit
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:block ml-10 mr-auto">
            <HeaderNavigation />
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <SearchButtonComponent />
            {isLoggedIn && <HeaderDropdown />}
            <HeaderLogin />
          </div>

          {/* Mobile Right Side */}
          <div className="flex lg:hidden items-center gap-2">
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
              <Link href="/quickstart">
                <Button size="sm" className="text-xs px-3 py-1">
                  Get Started
                </Button>
              </Link>
            )}
            <button
              className="p-2"
              type="button"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-3">
              <div className="mb-4">
                <HeaderNavigation
                  mobile
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </div>
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

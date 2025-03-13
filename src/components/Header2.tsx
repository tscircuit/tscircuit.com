import { Button } from "@/components/ui/button"
import {
  CircuitBoard,
  Search,
} from "lucide-react"
import { Link } from "wouter"
import { PrefetchPageLink } from "./PrefetchPageLink"
import { HeaderLogin } from "./HeaderLogin"
import SearchComponent from "./SearchComponent"
import HeaderDropdown from "./HeaderDropdown"
import { useState } from "react"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Analytics } from "./Analytics"

const SearchButtonComponent = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="relative">
      {isExpanded ? (
        <div className="flex items-center gap-2">
          <div className="w-32 bg-white">
            <SearchComponent />
          </div>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button> */}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="h-8 w-8"
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export const Header2 = () => {
  const isLoggedIn = useGlobalStore((state) => Boolean(state.session))
  return (
    <>
      {/* <div className="absolute left-0 top-0 z-[9999999]">
        <div className="hidden xl:block">xl</div>
        <div className="hidden lg:block xl:hidden">lg</div>
        <div className="hidden md:block lg:hidden">md</div>
        <div className="hidden sm:block md:hidden">sm</div>
        <div className="hidden xs:block sm:hidden">xs</div>
      </div> */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-2 md:px-6">
          <div className="flex items-center gap-2">
            <CircuitBoard className="h-6 w-6" />
            <span className="text-lg font-bold">tscircuit</span>
          </div>
          <nav className="flex md:hidden">
            {isLoggedIn && (
              <Link
                className="text-sm font-medium hover:underline underline-offset-4"
                href="/dashboard"
              >
                Dashboard
              </Link>
            )}
          </nav>
          <nav className="hidden md:flex gap-6">
            <PrefetchPageLink
              className="text-sm font-medium hover:underline underline-offset-4"
              href="/dashboard"
            >
              Dashboard
            </PrefetchPageLink>
            <PrefetchPageLink
              className="text-sm font-medium hover:underline underline-offset-4"
              href="/quickstart"
            >
              Editor
            </PrefetchPageLink>
            {/* <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="https://github.com/tscircuit/tscircuit"
          >
            Github
          </a> */}
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
          <div className="flex items-center gap-4">
            <SearchButtonComponent />
            {isLoggedIn && (
              <div className="hidden sm:block">
                <HeaderDropdown />
              </div>
            )}
            <HeaderLogin />
          </div>
        </div>
      </header>
      <Analytics />
    </>
  )
}

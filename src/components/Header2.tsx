import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/hooks/use-global-store"
import { CircuitBoard, Search } from "lucide-react"
import { useState } from "react"
import { Link } from "wouter"
import { Analytics } from "./Analytics"
import CmdKMenu from "./CmdKMenu"
import HeaderDropdown from "./HeaderDropdown"
import { HeaderLogin } from "./HeaderLogin"
import { PrefetchPageLink } from "./PrefetchPageLink"
import SearchComponent from "./SearchComponent"

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
  const isLoggedIn = useGlobalStore((state) => Boolean(state.session))
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-2 md:px-6">
          <PrefetchPageLink
            href="/"
            className="flex select-none items-center gap-2"
          >
            <CircuitBoard className="h-6 w-6" />
            <span className="text-lg font-bold">tscircuit</span>
          </PrefetchPageLink>
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
      <CmdKMenu />
      <Analytics />
    </>
  )
}

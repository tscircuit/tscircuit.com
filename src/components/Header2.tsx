import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  CircuitBoard,
  Cpu,
  Layers,
  CloudLightningIcon as Lightning,
  Maximize2,
  Zap,
  Search,
  X,
} from "lucide-react"
import { Link } from "wouter"
import { PrefetchPageLink } from "./PrefetchPageLink"
import { HeaderLogin } from "./HeaderLogin"
import SearchComponent from "./SearchComponent"
import HeaderDropdown from "./HeaderDropdown"
import { useState } from "react"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Analytics } from "./Analytics"
import ToggleMode from "./ToggleMode"

const SearchButtonComponent = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="relative">
      {isExpanded ? (
        <div className="flex items-center gap-2">
          <div className="w-32 bg-white dark:bg-gray-800">
            <SearchComponent />
          </div>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
            className="w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button> */}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="w-8 h-8"
          aria-label="Open search"
        >
          <Search className="w-4 h-4 dark:text-slate-200" />
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 dark:bg-gray-800/20 backdrop-blur-sm dark:border-slate-950 ">
        <div className="container flex items-center justify-between h-16 px-2 mx-auto md:px-6">
          <div className="flex items-center gap-2">
            <CircuitBoard className="w-6 h-6 dark:text-gray-300" />
            <span className="text-lg font-bold dark:text-gray-300">
              tscircuit
            </span>
          </div>
          <nav className="flex md:hidden">
            {isLoggedIn && (
              <Link
                className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
                href="/dashboard"
              >
                Dashboard
              </Link>
            )}
          </nav>
          <nav className="hidden gap-6 md:flex">
            <PrefetchPageLink
              className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
              href="/dashboard"
            >
              Dashboard
            </PrefetchPageLink>
            <PrefetchPageLink
              className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
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
              className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
              href="https://docs.tscircuit.com"
            >
              Docs
            </a>
            <a
              className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
              href="https://tscircuit.com/join"
            >
              Discord
            </a>
            <a
              className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-300"
              href="mailto:hello@tscircuit.com"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <ToggleMode />
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

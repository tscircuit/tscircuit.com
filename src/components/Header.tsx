import { HeaderLogin } from "@/components/HeaderLogin"
import { useGlobalStore } from "@/hooks/use-global-store"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Menu, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "wouter"
import CmdKMenu from "./CmdKMenu"
import HeaderDropdown from "./HeaderDropdown"
import SearchComponent from "./SearchComponent"
import { Analytics } from "./Analytics"
import { HeaderNavigation } from "./HeaderNavigation"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const sessionToken = useGlobalStore((s) => s.session?.token)

  useEffect(() => {
    window.TSCIRCUIT_REGISTRY_TOKEN = sessionToken ?? ""
  }, [sessionToken])

  return (
    <header className="relative z-40 border-b border-gray-200 bg-white px-4">
      <div className="flex min-h-[70px] items-center gap-6">
        <a
          href="/"
          className="text-base font-medium whitespace-nowrap select-none"
        >
          <span className="bg-[#4b8bf4] px-2 py-1 rounded-md text-white">
            tscircuit
          </span>
        </a>
        <div className="hidden lg:block">
          <HeaderNavigation />
        </div>
        <div className="flex-grow"></div>
        <a
          href="https://github.com/tscircuit/tscircuit"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200"
          aria-label="View TSCircuit on GitHub"
        >
          <GitHubLogoIcon className="hidden lg:block text-gray-400 hover:text-gray-600 transition-colors" />
        </a>
        <div className="hidden lg:flex items-center gap-3">
          <div className="hidden xl:block">
            <SearchComponent />
          </div>
          <Link
            href="/search"
            aria-label="Search"
            className="xl:hidden rounded-lg border border-gray-200 p-2"
          >
            <Search className="h-4 w-4" />
          </Link>
          <HeaderDropdown />
          <HeaderLogin />
        </div>
        <button
          className="lg:hidden"
          type="button"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden border-t py-4">
          <div className="mb-4">
            <HeaderNavigation
              mobile
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
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

import { ChevronDown } from "lucide-react"
import { Link, useLocation } from "wouter"
import { useGlobalStore } from "@/hooks/use-global-store"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const communityLinks = [
  { label: "Discord", href: "/join" },
  { label: "Knowledge Base", href: "https://community.tscircuit.com" },
]

export function HeaderNavigation({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const [location] = useLocation()
  const linkClass = cn(
    "inline-flex min-h-9 items-center rounded-md text-sm font-medium text-gray-900 transition-colors hover:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
    mobile && "w-full px-3 py-2",
  )
  const communityLinkClass =
    "block rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"

  return (
    <nav
      aria-label="Primary navigation"
      className={cn("flex", mobile ? "flex-col gap-1" : "items-center gap-6")}
    >
      {isLoggedIn && (
        <Link href="/dashboard" className={linkClass} onClick={onNavigate}>
          Dashboard
        </Link>
      )}
      <a href="/playground" className={linkClass} onClick={onNavigate}>
        Playground
      </a>
      <a href="https://docs.tscircuit.com/" className={linkClass}>
        Docs
      </a>
      <Link
        href="/datasheets"
        className={cn(
          linkClass,
          location.startsWith("/datasheet") && "text-blue-600",
        )}
        aria-current={location === "/datasheets" ? "page" : undefined}
        onClick={onNavigate}
      >
        Datasheets
      </Link>
      {mobile ? (
        <details className="group">
          <summary
            className={cn(
              linkClass,
              "cursor-pointer list-none gap-2 [&::-webkit-details-marker]:hidden",
            )}
          >
            Community
            <ChevronDown
              className="h-3 w-3 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="ml-3 grid gap-1">
            {communityLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className={communityLinkClass}
                onClick={onNavigate}
              >
                {label}
              </a>
            ))}
          </div>
        </details>
      ) : (
        <NavigationMenu delayDuration={0} aria-label="Community">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                Community
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-48 gap-1 p-2">
                  {communityLinks.map(({ label, href }) => (
                    <NavigationMenuLink key={href} asChild>
                      <a href={href} className={communityLinkClass}>
                        {label}
                      </a>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}
      {mobile && (
        <Link href="/search" className={linkClass} onClick={onNavigate}>
          Search
        </Link>
      )}
    </nav>
  )
}

import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Building2, ChevronDown, SquarePen } from "lucide-react"
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
  { label: "Blog", href: "https://blog.tscircuit.com" },
  { label: "Discord", href: "/join" },
  { label: "Knowledge Base", href: "https://community.tscircuit.com" },
]

function NpmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 7" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M0 0v6h5v1h4V6h9V0H0zm5 5H4V2H3v3H1V1h4v4zm4 0H7v1H6V1h4v4H9zm8 0h-1V2h-1v3h-1V2h-1v3h-2V1h6v4zM7 2h2v2H7V2z"
      />
    </svg>
  )
}

const productLinks = [
  { label: "Online Playground", href: "/playground", Icon: SquarePen },
  {
    label: "NPM Package",
    href: "https://www.npmjs.com/package/tscircuit",
    Icon: NpmIcon,
  },
  {
    label: "tscircuit Skill",
    href: "https://github.com/tscircuit/skill",
    Icon: GitHubLogoIcon,
  },
  { label: "tscircuit Enterprise", href: "/enterprise", Icon: Building2 },
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
  const productLinkClass = cn(communityLinkClass, "flex items-center gap-2")

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
      {mobile ? (
        <details className="group">
          <summary
            className={cn(
              linkClass,
              "cursor-pointer list-none gap-2 [&::-webkit-details-marker]:hidden",
            )}
          >
            Product
            <ChevronDown
              className="h-3 w-3 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="ml-3 grid gap-1">
            {productLinks.map(({ label, href, Icon }) => (
              <a
                key={href}
                href={href}
                className={productLinkClass}
                onClick={onNavigate}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </details>
      ) : (
        <NavigationMenu delayDuration={0} aria-label="Product">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                Product
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-56 gap-1 p-2">
                  {productLinks.map(({ label, href, Icon }) => (
                    <NavigationMenuLink key={href} asChild>
                      <a href={href} className={productLinkClass}>
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
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

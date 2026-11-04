import "./header.css"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Building2, ChevronDown, FileText, SquarePen } from "lucide-react"
import { Link } from "wouter"
import { useGlobalStore } from "@/hooks/use-global-store"
import { cn } from "@/lib/utils"
import { type ComponentType, useEffect, useRef } from "react"

const solutionLinks = [
  { label: "Professional Support", href: "/professional-support" },
  { label: "Verified Chips Program", href: "/verified-chips" },
]

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
  { label: "Datasheets", href: "/datasheets", Icon: FileText },
  { label: "tscircuit Enterprise", href: "/enterprise", Icon: Building2 },
]

type HeaderLink = {
  label: string
  href: string
  Icon?: ComponentType<{
    className?: string
    "aria-hidden"?: boolean | "true" | "false"
  }>
}

function HeaderNavigationDropdown({
  label,
  links,
  onNavigate,
}: {
  label: string
  links: HeaderLink[]
  onNavigate?: () => void
}) {
  return (
    <details className="header-nav-dropdown">
      <summary>
        {label}
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </summary>
      <div className="header-nav-panel">
        {links.map(({ label: linkLabel, href, Icon }) => (
          <a key={href} href={href} onClick={onNavigate}>
            {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
            {linkLabel}
          </a>
        ))}
      </div>
    </details>
  )
}

export function HeaderNavigation({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const navigationRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const navigation = navigationRef.current
    if (!navigation) return
    const dropdowns = Array.from(
      navigation.querySelectorAll<HTMLDetailsElement>("details"),
    )
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)")
    const closeOthers = (current?: HTMLDetailsElement) => {
      for (const dropdown of dropdowns) {
        if (dropdown !== current) dropdown.open = false
      }
    }
    const cleanup = dropdowns.map((dropdown) => {
      const enter = () => {
        if (mobile || !hover.matches) return
        closeOthers(dropdown)
        dropdown.open = true
      }
      const leave = () => {
        if (!mobile && hover.matches && !dropdown.matches(":focus-within")) {
          dropdown.open = false
        }
      }
      const toggle = () => {
        if (dropdown.open) closeOthers(dropdown)
      }
      const focusout = (event: FocusEvent) => {
        if (!mobile && !dropdown.contains(event.relatedTarget as Node | null)) {
          dropdown.open = false
        }
      }
      const keydown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && dropdown.open) {
          event.preventDefault()
          dropdown.open = false
          dropdown.querySelector("summary")?.focus()
        }
      }
      dropdown.addEventListener("pointerenter", enter)
      dropdown.addEventListener("pointerleave", leave)
      dropdown.addEventListener("toggle", toggle)
      dropdown.addEventListener("focusout", focusout)
      dropdown.addEventListener("keydown", keydown)
      return () => {
        dropdown.removeEventListener("pointerenter", enter)
        dropdown.removeEventListener("pointerleave", leave)
        dropdown.removeEventListener("toggle", toggle)
        dropdown.removeEventListener("focusout", focusout)
        dropdown.removeEventListener("keydown", keydown)
      }
    })
    const dismiss = (event: PointerEvent) => {
      if (!navigation.contains(event.target as Node)) closeOthers()
    }
    document.addEventListener("pointerdown", dismiss)
    return () => {
      cleanup.forEach((remove) => remove())
      document.removeEventListener("pointerdown", dismiss)
    }
  }, [mobile])

  return (
    <nav
      ref={navigationRef}
      aria-label="Primary navigation"
      className={cn("header-navigation", mobile && "header-navigation-mobile")}
    >
      {isLoggedIn && (
        <Link href="/dashboard" onClick={onNavigate}>
          Dashboard
        </Link>
      )}
      <HeaderNavigationDropdown
        label="Product"
        links={productLinks}
        onNavigate={onNavigate}
      />
      <a href="https://docs.tscircuit.com/">Docs</a>
      <HeaderNavigationDropdown
        label="Solutions"
        links={solutionLinks}
        onNavigate={onNavigate}
      />
      <HeaderNavigationDropdown
        label="Community"
        links={communityLinks}
        onNavigate={onNavigate}
      />
      {mobile && (
        <Link href="/search" onClick={onNavigate}>
          Search
        </Link>
      )}
    </nav>
  )
}

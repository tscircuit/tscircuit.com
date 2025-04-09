import { useGlobalStore } from "@/hooks/use-global-store"
import { CircuitBoard } from "lucide-react"
import { Link } from "wouter"
import { PrefetchPageLink } from "./PrefetchPageLink"

export default function Footer() {
  const session = useGlobalStore((s) => s.session)
  const isLoggedIn = Boolean(session)

  return (
    <footer className="bg-white text-black py-12 border-t mt-8">
      <div className="container mx-auto px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CircuitBoard className="h-6 w-6" />
            <span className="text-lg font-bold">tscircuit</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The New Foundation for Electronic Design
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm text-gray-600 mt-8">
          <div className="space-y-4">
            <footer className="flex flex-col space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Dashboard", href: "/dashboard" },
                { name: "Editor", href: "/editor" },
                { name: "Create with AI", href: "https://chat.tscircuit.com" },
                {
                  name: "My Profile",
                  href: `/${session?.github_username}`,
                  hidden: !isLoggedIn,
                },
                { name: "Settings", href: "/settings" },
              ]
                .filter((item) => !item.hidden)
                .map((item) => (
                  <PrefetchPageLink
                    key={item.name}
                    href={item.href}
                    className="hover:underline"
                  >
                    {item.name}
                  </PrefetchPageLink>
                ))}
            </footer>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold uppercase">Explore</h3>
            <footer className="flex flex-col space-y-2">
              <PrefetchPageLink href="/newest" className="hover:underline">
                Newest Snippets
              </PrefetchPageLink>
              <PrefetchPageLink href="/trending" className="hover:underline">
                Trending Snippets
              </PrefetchPageLink>
              <a href="https://docs.tscircuit.com" className="hover:underline">
                Docs
              </a>
            </footer>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold uppercase">Follow</h3>
            <footer className="flex flex-col space-y-2">
              <a href="https://blog.tscircuit.com" className="hover:underline">
                Blog
              </a>
              <a href="https://x.com/tscircuit" className="hover:underline">
                Twitter
              </a>
              <a href="https://tscircuit.com/join" className="hover:underline">
                Discord
              </a>
              <a
                href="https://github.com/tscircuit/tscircuit"
                className="hover:underline"
              >
                GitHub
              </a>
              <a
                href="https://youtube.com/@seveibar"
                className="hover:underline"
              >
                YouTube
              </a>
            </footer>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold uppercase">Company</h3>
            <nav className="flex flex-col space-y-2">
              <a
                href="https://tscircuit.com/legal/terms-of-service"
                className="hover:underline"
              >
                Terms of Service
              </a>
              <a
                href="https://tscircuit.com/legal/privacy-policy"
                className="hover:underline"
              >
                Privacy Policy
              </a>
              <a
                href="mailto:contact@tscircuit.com"
                className="hover:underline"
              >
                contact@tscircuit.com
              </a>
              <div className="flex-grow" />
              <div className="text-xs text-gray-500">
                we are inspired by{" "}
                <a href="https://val.town" className="underline">
                  val.town
                </a>
                ,{" "}
                <a href="https://codesandbox.io/" className="underline">
                  codesandbox
                </a>{" "}
                and{" "}
                <a href="https://v0.dev" className="underline">
                  v0.dev
                </a>
              </div>
              <div className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} tscircuit Inc.
              </div>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

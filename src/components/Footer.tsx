import { useGlobalStore } from "@/hooks/use-global-store"
import { Link } from "wouter"

export default function Footer() {
  const session = useGlobalStore((s) => s.session)
  const isLoggedIn = Boolean(session)

  return (
    <footer className="mt-8 border-t border-slate-200 bg-slate-50 py-10 text-slate-900">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))] lg:gap-7">
          <div className="space-y-4">
            <Link href="/" className="flex select-none items-center">
              <span className="rounded-md bg-blue-500 px-2 py-1 text-sm font-semibold text-white sm:text-base">
                tscircuit
              </span>
            </Link>
            <p className="max-w-xs text-[13px] leading-6 text-slate-600">
              The New Foundation for Electronic Design
            </p>
          </div>

          <div className="space-y-3">
            <h3
              className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              Product
            </h3>
            <nav
              className="flex flex-col gap-2 text-[11px] text-slate-600"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {[
                { name: "Home", href: "/" },
                { name: "Dashboard", href: "/dashboard" },
                { name: "Editor", href: "/editor" },
                { name: "Sign In", href: "/login" },
                {
                  name: "My Profile",
                  href: `/${session?.tscircuit_handle}`,
                  hidden: !isLoggedIn,
                },
              ]
                .filter((item) => !item.hidden)
                .map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="w-fit hover:text-slate-900 hover:underline"
                  >
                    {item.name}
                  </Link>
                ))}
              <a
                href="https://chat.tscircuit.com"
                className="w-fit hover:text-slate-900 hover:underline"
                target="_blank"
              >
                Create with AI
              </a>
            </nav>
          </div>

          <div className="space-y-3">
            <h3
              className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              Explore
            </h3>
            <nav
              className="flex flex-col gap-2 text-[11px] text-slate-600"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              <Link href="/latest" className="hover:underline w-fit">
                Latest Packages
              </Link>
              <Link href="/trending" className="hover:underline w-fit">
                Trending Packages
              </Link>
              <Link href="/search" className="hover:underline w-fit">
                Search Packages
              </Link>
              <a
                href="https://docs.tscircuit.com"
                className="hover:underline w-fit"
              >
                Docs
              </a>
            </nav>
          </div>

          <div className="space-y-3">
            <h3
              className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              Follow
            </h3>
            <nav
              className="flex flex-col gap-2 text-[11px] text-slate-600"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              <a
                href="https://blog.tscircuit.com"
                className="hover:underline w-fit"
              >
                Blog
              </a>
              <a
                href="https://x.com/tscircuit"
                className="hover:underline w-fit"
              >
                Twitter
              </a>
              <a
                href="https://tscircuit.com/join"
                className="hover:underline w-fit"
              >
                Discord
              </a>
              <a
                href="https://github.com/tscircuit/tscircuit"
                className="hover:underline w-fit"
              >
                GitHub
              </a>
              <a
                href="https://youtube.com/@seveibar"
                className="hover:underline w-fit"
              >
                YouTube
              </a>
            </nav>
          </div>

          <div className="space-y-3">
            <h3
              className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              Company
            </h3>
            <nav
              className="flex flex-col gap-2 text-[11px] text-slate-600"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              <a
                href="https://tscircuit.com/legal/terms-of-service"
                className="hover:underline w-fit"
              >
                Terms of Service
              </a>
              <a
                href="https://tscircuit.com/legal/privacy-policy"
                className="hover:underline w-fit"
              >
                Privacy Policy
              </a>
              <a
                href="mailto:contact@tscircuit.com"
                className="hover:underline w-fit"
              >
                contact@tscircuit.com
              </a>
            </nav>
          </div>
        </div>

        <div
          className="mt-8 border-t border-slate-200 pt-6 text-[11px] text-slate-500"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
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
            <div>&copy; {new Date().getFullYear()} tscircuit Inc.</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

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
} from "lucide-react"
import { Link } from "wouter"
import { HeaderLogin } from "./HeaderLogin"

export const Header2 = () => (
  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto flex h-16 items-center justify-between px-2 md:px-6">
      <div className="flex items-center gap-2">
        <CircuitBoard className="h-6 w-6" />
        <span className="text-lg font-bold">tscircuit</span>
      </div>
      <nav className="hidden md:flex gap-6">
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/dashboard"
        >
          Dashboard
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/editor"
        >
          Editor
        </Link>
        <a
          className="text-sm font-medium hover:underline underline-offset-4"
          href="https://github.com/tscircuit/tscircuit"
        >
          Github
        </a>
        <a
          className="text-sm font-medium hover:underline underline-offset-4"
          href="https://docs.tscircuit.com"
        >
          Docs
        </a>
        <a
          className="text-sm font-medium hover:underline underline-offset-4"
          href="mailto:hello@tscircuit.com"
        >
          Contact
        </a>
      </nav>
      <div className="flex items-center gap-4">
        <HeaderLogin />
      </div>
    </div>
  </header>
)

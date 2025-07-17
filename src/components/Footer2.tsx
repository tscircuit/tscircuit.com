import { Header2 } from "@/components/Header2"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CircuitBoard,
  Cpu,
  Layers,
  CloudLightningIcon as Lightning,
  Maximize2,
  Zap,
} from "lucide-react"
import { Link } from "wouter"

export const Footer2 = () => (
  <footer className="w-full py-6 bg-background">
    <div className="container px-4 md:px-6 mx-auto">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CircuitBoard className="h-6 w-6" />
            <span className="text-lg font-bold">tscircuit</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Transforming electronic design with AI-powered tools.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="text-muted-foreground hover:underline" href="#">
                Features
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground hover:underline" href="#">
                Pricing
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground hover:underline" href="#">
                Tutorials
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="text-muted-foreground hover:underline" href="#">
                About
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground hover:underline" href="#">
                Blog
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground hover:underline" href="#">
                Careers
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="text-muted-foreground hover:underline" href="#">
                Privacy
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground hover:underline" href="#">
                Terms
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground hover:underline" href="#">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} tscircuit. All rights reserved.
      </div>
    </div>
  </footer>
)

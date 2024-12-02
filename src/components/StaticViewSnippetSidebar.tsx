import React from "react"
import { cn } from "@/lib/utils"
import { Code, Bot, GitFork, AtSign, Package, Clock, File } from "lucide-react"

export default function StaticViewSnippetSidebar({
  className,
}: {
  className?: string
}) {
  const sidebarItems = [
    {
      icon: <Code className="w-5 h-5" />,
      label: "Edit Code",
      href: "#",
    },
    {
      icon: <Bot className="w-5 h-5" />,
      label: "Edit with AI",
      badge: "AI",
      href: "#",
    },
    {
      icon: <GitFork className="w-5 h-5" />,
      label: "Forks",
      notImplemented: true,
    },
    {
      icon: <AtSign className="w-5 h-5" />,
      label: "References",
      notImplemented: true,
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Dependencies",
      notImplemented: true,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Versions",
      notImplemented: true,
    },
    {
      icon: <File className="w-5 h-5" />,
      label: "Files",
      href: "#",
    },
  ]

  return (
    <div
      className={cn(
        "w-64 h-full bg-gray-100 text-gray-700 flex flex-col flex-shrink-0",
        "hidden sm:block h-screen sticky top-0",
        className,
      )}
    >
      <nav className="flex-grow overflow-y-auto">
        <ul className="p-2 space-y-2">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href ?? "#"}
                className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-200 rounded-md"
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200 space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-medium">Copy embed code</div>
          <div className="text-[0.5em] p-2 rounded-sm bg-blue-50 border border-blue-200 cursor-pointer font-mono whitespace-nowrap overflow-hidden text-ellipsis">
            {
              '<iframe src="/preview?snippet_id=example" width="100%" height="500" frameborder="0"></iframe>'
            }
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium">Copy import code</div>
          <div className="text-[0.5em] p-2 rounded-sm bg-blue-50 border border-blue-200 cursor-pointer font-mono whitespace-nowrap overflow-hidden text-ellipsis">
            {'import CircuitModule from "@tsci/example.snippet"'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium">Copy install command</div>
          <div className="text-[0.5em] p-2 rounded-sm bg-blue-50 border border-blue-200 cursor-pointer font-mono whitespace-nowrap overflow-hidden text-ellipsis">
            {"tsci add @tsci/example.snippet"}
          </div>
        </div>
      </div>
    </div>
  )
}

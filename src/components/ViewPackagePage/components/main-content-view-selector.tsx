"use client"
import React from "react"
import {
  Code,
  CuboidIcon as Cube,
  CircuitBoardIcon as Circuit,
  FileTerminal,
  ClipboardList,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface MainContentViewSelectorProps {
  activeView: string
  onViewChange: (view: string) => void
}

export default function MainContentViewSelector({
  activeView,
  onViewChange,
}: MainContentViewSelectorProps) {
  const views = [
    { id: "files", label: "Files", icon: <Code className="h-4 w-4 mr-1" /> },
    { id: "3d", label: "3D", icon: <Cube className="h-4 w-4 mr-1" /> },
    { id: "pcb", label: "PCB", icon: <Circuit className="h-4 w-4 mr-1" /> },
    {
      id: "schematic",
      label: "Schematic",
      icon: <FileTerminal className="h-4 w-4 mr-1" />,
    },
    {
      id: "bom",
      label: "BOM",
      icon: <ClipboardList className="h-4 w-4 mr-1" />,
    },
  ]

  return (
    <>
      {/* Desktop Tabs */}
      <div className="bg-gray-100 dark:bg-[#161b22] rounded-md p-1 hidden lg:flex">
        {views.map((view) => (
          <button
            key={view.id}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
              activeView === view.id
                ? "bg-white dark:bg-[#0d1117] text-gray-800 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            }`}
            onClick={() => onViewChange(view.id)}
          >
            {React.cloneElement(view.icon, { className: "h-4 w-4 mr-1" })}
            {view.label}
          </button>
        ))}
      </div>

      {/* Mobile Dropdown */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-gray-300 dark:border-[#30363d] bg-gray-100 hover:bg-gray-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-gray-700 dark:text-[#c9d1d9]"
            >
              {views.find((view) => view.id === activeView)?.icon}
              {views.find((view) => view.id === activeView)?.label || "View"}
              <svg
                className="h-4 w-4 ml-1"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {views.map((view) => (
              <DropdownMenuItem
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className="flex items-center cursor-pointer"
              >
                {view.icon}
                {view.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

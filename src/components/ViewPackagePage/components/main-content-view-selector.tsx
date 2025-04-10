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
import { useCurrentPackageCircuitJson } from "@/components/ViewPackagePage/hooks/use-current-package-circuit-json"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface MainContentViewSelectorProps {
  activeView: string
  onViewChange: (view: string) => void
  disabledViews?: string[]
}

export default function MainContentViewSelector({
  activeView,
  onViewChange,
  disabledViews = [],
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

  const isViewDisabled = (viewId: string) => disabledViews.includes(viewId)

  return (
    <>
      {/* Desktop Tabs */}
      <div className="bg-gray-100 dark:bg-[#161b22] rounded-md p-1 hidden lg:flex">
        <TooltipProvider>
          {views.map((view) => {
            const disabled = isViewDisabled(view.id);
            return (
              <Tooltip key={view.id} delayDuration={100}>
                <TooltipTrigger asChild>
                  <button
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${activeView === view.id
                      ? "bg-white dark:bg-[#0d1117] text-gray-800 dark:text-white"
                      : disabled
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                      }`}
                    onClick={() => !disabled && onViewChange(view.id)}
                    disabled={disabled}
                  >
                    {React.cloneElement(view.icon, {
                      className: `h-4 w-4 mr-1 ${disabled ? 'opacity-50' : ''}`
                    })}
                    {view.label}
                  </button>
                </TooltipTrigger>
                {disabled && (
                  <TooltipContent
                    className="bg-gray-800 text-white text-xs px-2 py-1 rounded z-50"
                    side="top"
                  >
                    Circuit JSON not available
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Mobile Dropdown */}
      < div className="lg:hidden" >
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
            <TooltipProvider>
              {views.map((view) => {
                const disabled = isViewDisabled(view.id)
                return (
                  <Tooltip key={view.id}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        key={view.id}
                        onClick={() => !disabled && onViewChange(view.id)}
                        className={`flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        disabled={disabled}
                      >
                        {React.cloneElement(view.icon, {
                          className: `h-4 w-4 mr-1 ${disabled ? 'opacity-50' : ''}`
                        })}
                        {view.label}
                        {disabled && (
                          <span className="ml-auto text-xs text-gray-500">
                            Circuit JSON not found
                          </span>
                        )}
                      </DropdownMenuItem>
                    </TooltipTrigger>
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

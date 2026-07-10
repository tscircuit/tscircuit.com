import { cn } from "@/lib/utils"
import type { ResizeDirection } from "@/hooks/use-resizable"

interface ResizeDividerProps {
  direction?: ResizeDirection
  className?: string
  onMouseDown: React.MouseEventHandler
  onTouchStart: React.TouchEventHandler
}

/**
 * A thin, draggable divider bar that can be placed between two panels.
 * Spread the dragHandleProps from `useResizable` onto this component.
 */
export function ResizeDivider({
  direction = "horizontal",
  className,
  onMouseDown,
  onTouchStart,
}: ResizeDividerProps) {
  const isHorizontal = direction === "horizontal"

  return (
    <div
      role="separator"
      aria-orientation={isHorizontal ? "vertical" : "horizontal"}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={cn(
        "group relative flex items-center justify-center flex-shrink-0 z-10",
        isHorizontal
          ? "w-[5px] h-full cursor-col-resize"
          : "h-[5px] w-full cursor-row-resize",
        "bg-transparent hover:bg-blue-200 active:bg-blue-400 transition-colors duration-150",
        "select-none touch-none",
        className,
      )}
    >
      {/* visual pill */}
      <div
        className={cn(
          "rounded-full bg-gray-300 group-hover:bg-blue-400 group-active:bg-blue-600 transition-colors duration-150",
          isHorizontal ? "w-[3px] h-8" : "h-[3px] w-8",
        )}
      />
    </div>
  )
}

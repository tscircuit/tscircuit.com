import React, { useRef, useState, useLayoutEffect } from "react"
import { PCBViewer } from "@tscircuit/pcb-viewer"

export const PcbViewerWithContainerHeight = ({
  containerClassName,
  ...props
}: {
  containerClassName?: string
} & React.ComponentProps<typeof PCBViewer>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [computedHeight, setComputedHeight] = useState(620)

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight
        const screenHeight = window.innerHeight
        setComputedHeight(
          Math.min(Math.max(containerHeight, 620), screenHeight),
        )
      }
    }

    // Immediate synchronous calculation
    updateHeight()

    // Resize listener for dynamic changes
    const resizeObserver = new ResizeObserver(updateHeight)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Fallback for window resize
    window.addEventListener("resize", updateHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateHeight)
    }
  }, [])

  return (
    <div ref={containerRef} className={containerClassName || "w-full h-full"}>
      <PCBViewer {...props} height={computedHeight} />
    </div>
  )
}

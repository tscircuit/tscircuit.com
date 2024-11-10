import { type AnyCircuitElement } from "circuit-json"
import { useMouseMatrixTransform } from "use-mouse-matrix-transform"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { toString as transformToString } from "transformation-matrix"

interface Props {
  circuitJson: AnyCircuitElement[]
}

export const CircuitToSvgWithMouseControl = ({ circuitJson }: Props) => {
  const svgDivRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerBoundsRef = useRef({ width: 0, x: 0, y: 0 })

  const { ref: containerRef } = useMouseMatrixTransform({
    onSetTransform(transform) {
      if (!svgDivRef.current) return
      svgDivRef.current.style.transform = transformToString(transform)
    },
  })

  // updating the container bounds when the window is resized
  const updateContainerBounds = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    containerBoundsRef.current = {
      width: rect.width,
      x: rect.left,
      y: rect.top,
    }
    setContainerWidth(rect.width)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    updateContainerBounds()

    const resizeObserver = new ResizeObserver(() => {
      updateContainerBounds()
    })

    resizeObserver.observe(containerRef.current)
    window.addEventListener("resize", updateContainerBounds)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateContainerBounds)
    }
  }, [updateContainerBounds])

  const svg = useMemo(() => {
    if (!containerWidth) return ""

    return convertCircuitJsonToSchematicSvg(circuitJson, {
      width: containerWidth,
      height: 500,
    })
  }, [circuitJson, containerWidth])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{
        backgroundColor: "#F5F1ED",
        overflow: "hidden",
        cursor: "grab",
        touchAction: "none",
      }}
    >
      <div
        ref={svgDivRef}
        style={{
          pointerEvents: "none",
          transformOrigin: "0 0",
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}

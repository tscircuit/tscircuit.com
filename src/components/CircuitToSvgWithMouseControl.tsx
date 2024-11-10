import { type AnyCircuitElement } from "circuit-json"
import { useMouseMatrixTransform } from "use-mouse-matrix-transform"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { useEffect, useMemo, useRef, useState } from "react"
import { toString as transformToString } from "transformation-matrix"

interface Props {
  circuitJson: AnyCircuitElement[]
}

export const CircuitToSvgWithMouseControl = ({ circuitJson }: Props) => {
  const svgDivRef = useRef<HTMLDivElement>(null)
  const { ref: containerRef } = useMouseMatrixTransform({
    onSetTransform(transform) {
      if (!svgDivRef.current) return
      svgDivRef.current.style.transform = transformToString(transform)
    },
  })
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      setContainerWidth(
        containerRef.current?.getBoundingClientRect().width || 0,
      )
    }

    // Set initial width
    updateWidth()

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

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
      style={{
        backgroundColor: "#F5F1ED",
        overflow: "hidden",
        cursor: "grab",
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

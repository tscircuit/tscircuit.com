import { type AnyCircuitElement } from "circuit-json"
import { useMouseMatrixTransform } from "use-mouse-matrix-transform"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { 
  toString as transformToString, 
  Matrix,
  scale,
  translate,
  compose
} from "transformation-matrix"

interface Props {
  circuitJson: AnyCircuitElement[]
}

export const CircuitToSvgWithMouseControl = ({ circuitJson }: Props) => {
  const svgDivRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerBoundsRef = useRef({ width: 0, x: 0, y: 0 })

  const { 
    ref: containerRef, 
    transform: currentTransform,
    setTransform,
  } = useMouseMatrixTransform({
    onSetTransform(matrix: Matrix, event?: MouseEvent) {
      if (!svgDivRef.current || !containerRef.current) return

      // Get the current container bounds
      const bounds = containerBoundsRef.current
      
      if (event) {
        const mousePoint = {
          x: event.clientX - bounds.x,
          y: event.clientY - bounds.y
        }

        const prevScale = currentTransform.a
        const newScale = matrix.a
        const scaleFactor = newScale / prevScale

        // tranformation to scale around the mouse point
        const zoomTransform = compose(
          translate(mousePoint.x, mousePoint.y),
          scale(scaleFactor, scaleFactor),
          translate(-mousePoint.x, -mousePoint.y),
          currentTransform
        )

        svgDivRef.current.style.transform = transformToString(zoomTransform)
        setTransform(zoomTransform)
      } else {
        svgDivRef.current.style.transform = transformToString(matrix)
      }
    },
  })

  // updating the container bounds when the window is resized
  const updateContainerBounds = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    containerBoundsRef.current = {
      width: rect.width,
      x: rect.left,
      y: rect.top
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
    window.addEventListener('resize', updateContainerBounds)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateContainerBounds)
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
          width: "100%",
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}
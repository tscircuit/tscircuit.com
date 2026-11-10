import {
  type PackageCircuitChanges,
  circuitChangeOutlineColor,
} from "@/lib/package-circuit-changes"
import type { AnyCircuitElement } from "circuit-json"
import { type RefObject, useLayoutEffect } from "react"

const highlightAttribute = "data-preview-change-highlight"

function removeHighlights(container: HTMLElement) {
  for (const rectangle of container.querySelectorAll(`[${highlightAttribute}]`))
    rectangle.remove()
}

function drawHighlights({
  container,
  changes,
}: { container: HTMLElement; changes: PackageCircuitChanges }) {
  removeHighlights(container)
  const targets = [
    ...changes.components
      .filter((change) => change.kind !== "removed" && change.schematic)
      .map((change) => ({
        attribute: "data-schematic-component-id",
        id: change.schematic!.schematic_component_id,
      })),
    ...changes.schematicTextIds.map((id) => ({
      attribute: "data-schematic-text-id",
      id,
    })),
  ]
  for (const { attribute, id } of targets) {
    const target = container.querySelector<SVGGraphicsElement>(
      `[${attribute}="${CSS.escape(id)}"]`,
    )
    if (!target) continue
    const bounds = target.getBBox()
    const rectangle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    )
    rectangle.setAttribute(highlightAttribute, id)
    rectangle.setAttribute("x", String(bounds.x - 4))
    rectangle.setAttribute("y", String(bounds.y - 4))
    rectangle.setAttribute("width", String(bounds.width + 8))
    rectangle.setAttribute("height", String(bounds.height + 8))
    rectangle.setAttribute("fill", "none")
    rectangle.setAttribute("stroke", circuitChangeOutlineColor)
    rectangle.setAttribute("stroke-width", "1.5")
    rectangle.setAttribute("stroke-dasharray", "4 3")
    rectangle.setAttribute("vector-effect", "non-scaling-stroke")
    rectangle.setAttribute("pointer-events", "none")
    if (target.tagName.toLowerCase() === "g") target.append(rectangle)
    else {
      const transform = target.getAttribute("transform")
      if (transform) rectangle.setAttribute("transform", transform)
      target.parentNode?.appendChild(rectangle)
    }
  }
}

/** Follow the viewer's rendered SVG bounds, including labels and rotated text. */
export function useSchematicChangeHighlights({
  containerRef,
  changes,
  renderedCircuit,
}: {
  containerRef: RefObject<HTMLDivElement>
  changes: PackageCircuitChanges
  renderedCircuit?: readonly AnyCircuitElement[]
}) {
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (!changes.components.length && !changes.schematicTextIds.length) {
      removeHighlights(container)
      return
    }
    drawHighlights({ container, changes })
    const observer = new MutationObserver((mutations) => {
      // Ignore rectangles added/removed by this overlay itself.
      if (
        mutations.some((mutation) =>
          [...mutation.addedNodes, ...mutation.removedNodes].some(
            (node) =>
              !(
                node instanceof SVGElement &&
                node.hasAttribute(highlightAttribute)
              ),
          ),
        )
      )
        drawHighlights({ container, changes })
    })
    observer.observe(container, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      removeHighlights(container)
    }
  }, [containerRef, changes, renderedCircuit])
}

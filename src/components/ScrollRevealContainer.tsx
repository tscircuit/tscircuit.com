import { useEffect, useRef, ReactNode } from "react"

interface ScrollRevealContainerProps {
  children: ReactNode
  className?: string
}

export function ScrollRevealContainer({
  children,
  className = "",
}: ScrollRevealContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false

    const updateAnimation = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Map the element's position relative to the viewport to a 0-1 progress value.
      // startPoint: when the element's top is near the bottom of the screen (0% progress)
      // endPoint: when the element's top reaches the upper middle of the screen (100% progress)
      const startPoint = windowHeight * 0.99
      const endPoint = windowHeight * 0.1

      let progress = (startPoint - rect.top) / (startPoint - endPoint)
      // Clamp between 0 and 1
      progress = Math.max(0, Math.min(1, progress))

      // Apply a cubic ease-out so it feels smooth but responsive
      const easeOutProgress = 1 - Math.pow(1 - progress, 3)

      // Scale smoothly from 0.85 (zoomed out) up to 1.0 (full size)
      const scale = 0.85 + easeOutProgress * 0.15

      // Parallax upward float effect (from 100px down, up to 0)
      const translateY = 100 * (1 - easeOutProgress)

      // Fade in quickly during the first half of the scroll
      const opacity = Math.min(1, 0.2 + progress * 2)

      containerRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`
      containerRef.current.style.opacity = opacity.toString()

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateAnimation)
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    // Trigger immediately to set initial state based on current scroll position
    window.requestAnimationFrame(updateAnimation)

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        transformOrigin: "bottom center",
        willChange: "transform, opacity",
        opacity: 0, // Prevent flash of unstyled content
      }}
    >
      {children}
    </div>
  )
}

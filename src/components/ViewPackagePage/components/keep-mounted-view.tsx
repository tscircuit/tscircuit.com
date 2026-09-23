import { useState, type ReactNode } from "react"

/** Mount a viewer on first use, then preserve its expensive scene between tabs. */
export function KeepMountedView({
  active,
  children,
}: { active: boolean; children: ReactNode }) {
  const [visited, setVisited] = useState(active)
  if (active && !visited) setVisited(true)

  return <div hidden={!active}>{(active || visited) && children}</div>
}

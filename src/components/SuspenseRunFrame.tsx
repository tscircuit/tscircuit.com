import { lazy, Suspense } from "react"

const RunFrame = lazy(async () => {
  const { RunFrame } = await import("@tscircuit/runframe/runner")
  return { default: RunFrame }
})

export const SuspenseRunFrame = (
  props: React.ComponentProps<typeof RunFrame>,
) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="h-[98vh]">
        <RunFrame {...props} />
      </div>
    </Suspense>
  )
}

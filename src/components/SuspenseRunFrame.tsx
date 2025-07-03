import { lazy, Suspense } from "react"

const RunFrame = lazy(async () => {
  const { RunFrame } = await import("@tscircuit/runframe/runner")
  return { default: RunFrame }
})

export const SuspenseRunFrame = (
  props: React.ComponentProps<typeof RunFrame>,
) => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <div className="w-48">
            <div className="loading">
              <div className="loading-bar"></div>
            </div>
          </div>
        </div>
      }
    >
      <div className="h-[98vh]">
        <RunFrame {...props} />
      </div>
    </Suspense>
  )
}

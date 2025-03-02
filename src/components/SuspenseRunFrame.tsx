import { lazy, Suspense } from "react"

const RunFrame = lazy(async () => {
  const { RunFrame } = await import("@tscircuit/runframe/runner")
  return { default: RunFrame }
})

export const SuspenseRunFrame = (
  props: React.ComponentProps<typeof RunFrame>,
) => {
  console.log(props.fsMap)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RunFrame {...props} />
    </Suspense>
  )
}

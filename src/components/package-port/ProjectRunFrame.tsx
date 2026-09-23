import {
  fetchTscircuitWorker,
  getProjectTscircuitVersion,
} from "@/lib/get-project-tscircuit-version"
import { type ComponentProps, useEffect, useState } from "react"
import { SuspenseRunFrame } from "../SuspenseRunFrame"

type Props = ComponentProps<typeof SuspenseRunFrame>

export function ProjectRunFrame(props: Props) {
  if (props.isLoadingFiles)
    return <div role="status">Loading project files…</div>

  const files =
    props.fsMap instanceof Map
      ? Object.fromEntries(props.fsMap)
      : (props.fsMap ?? {})
  let version: string | undefined
  try {
    version = getProjectTscircuitVersion(files)
  } catch (cause) {
    return (
      <div role="alert">
        {cause instanceof Error ? cause.message : String(cause)}
      </div>
    )
  }

  if (!version) return <SuspenseRunFrame {...props} forceLatestEvalVersion />
  return <PinnedRuntime key={version} {...props} version={version} />
}

function PinnedRuntime({ version, ...props }: Props & { version: string }) {
  const [workerUrl, setWorkerUrl] = useState<string>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | undefined
    const previousWorker = globalThis.runFrameWorker
    globalThis.runFrameWorker = undefined
    void previousWorker?.kill()
    setWorkerUrl(undefined)
    setError(undefined)
    void fetchTscircuitWorker(version)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setWorkerUrl(objectUrl)
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      })

    return () => {
      cancelled = true
      const activeWorker = globalThis.runFrameWorker
      globalThis.runFrameWorker = undefined
      void activeWorker?.kill()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [version])

  if (error) return <div role="alert">{error}</div>
  if (!workerUrl) return <div role="status">Loading project runtime…</div>

  return (
    <SuspenseRunFrame
      {...props}
      evalVersion="latest"
      evalWebWorkerBlobUrl={workerUrl}
      forceLatestEvalVersion={false}
    />
  )
}

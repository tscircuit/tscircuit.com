import { useEffect, useState, type ComponentProps } from "react"
import { createCircuitWebWorker } from "@tscircuit/eval/worker"
import { SuspenseRunFrame } from "../SuspenseRunFrame"
import { getProjectTscircuitVersion } from "@/lib/get-project-tscircuit-version"

type Props = ComponentProps<typeof SuspenseRunFrame>

// Worker creation itself is asynchronous. Serialize it so a slow, obsolete
// request cannot kill the next project's worker when navigating between projects.
let workerSetup: Promise<void> = Promise.resolve()

export function ProjectRunFrame(props: Props) {
  const files =
    props.fsMap instanceof Map
      ? Object.fromEntries(props.fsMap)
      : (props.fsMap ?? {})
  let version: string | undefined
  let error: string | undefined
  try {
    version = getProjectTscircuitVersion(files)
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause)
  }
  if (props.isLoadingFiles)
    return <div role="status">Loading project files…</div>
  if (error) return <div role="alert">{error}</div>

  return (
    <ProjectRuntime key={version ?? "latest"} {...props} version={version} />
  )
}

function ProjectRuntime({ version, ...props }: Props & { version?: string }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string>()
  const [workerUrl, setWorkerUrl] = useState<string>()
  const token = props.tscircuitSessionToken
  const proxyUrl = props.easyEdaProxyConfig?.proxyEndpointUrl
  const proxyHeaders = JSON.stringify(props.easyEdaProxyConfig?.headers)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    let blobUrl: string | undefined
    let worker: Awaited<ReturnType<typeof createCircuitWebWorker>> | undefined
    setReady(false)
    setError(undefined)
    workerSetup = workerSetup
      .catch(() => {})
      .then(async () => {
        if (cancelled) return
        try {
          const previous = globalThis.runFrameWorker
          globalThis.runFrameWorker = undefined
          await previous?.kill()
          if (version) {
            const response = await fetch(
              `https://cdn.jsdelivr.net/npm/tscircuit@${version}/dist/webworker.min.js`,
              { signal: controller.signal },
            )
            if (!response.ok) {
              throw new Error(
                `Could not load the tscircuit ${version} worker (${response.status}). This version may predate bundled workers. Update the project dependency to a version that includes dist/webworker.min.js.`,
              )
            }
            blobUrl = URL.createObjectURL(await response.blob())
          }
          if (cancelled) return
          worker = await createCircuitWebWorker({
            evalVersion: "latest",
            webWorkerBlobUrl: blobUrl,
            tscircuitSessionToken: token,
            projectConfig: {
              projectBaseUrl: props.projectBaseUrl ?? "/api/files/static",
              enablePartOrientationAnalysis: true,
            },
            ...(proxyUrl && {
              easyEdaProxyConfig: {
                proxyEndpointUrl: proxyUrl,
                headers: proxyHeaders ? JSON.parse(proxyHeaders) : undefined,
              },
            }),
          })
          if (cancelled) {
            await worker.kill()
            return
          }
          globalThis.runFrameWorker = worker
          setWorkerUrl(blobUrl)
          setReady(true)
        } catch (cause) {
          if (!cancelled)
            setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          if (cancelled && blobUrl) URL.revokeObjectURL(blobUrl)
        }
      })
    return () => {
      cancelled = true
      controller.abort()
      // RunFrame can replace the worker after Stop/Run. Dispose the active
      // instance rather than releasing an already-terminated Comlink proxy.
      const activeWorker = globalThis.runFrameWorker
      globalThis.runFrameWorker = undefined
      void activeWorker?.kill()
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [version, token, proxyUrl, proxyHeaders, props.projectBaseUrl])

  if (error) return <div role="alert">{error}</div>
  if (!ready) return <div role="status">Loading project runtime…</div>
  return (
    <SuspenseRunFrame
      {...props}
      evalVersion="latest"
      evalWebWorkerBlobUrl={workerUrl}
      forceLatestEvalVersion={false}
    />
  )
}

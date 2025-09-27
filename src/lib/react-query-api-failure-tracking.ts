import type { QueryKey } from "react-query"
import { posthog } from "./posthog"

const TARGET_HOSTNAMES = new Set(["api.tscircuit.com"])

type FailureContext = {
  operationType: "query" | "mutation"
  queryKey?: QueryKey
  mutationKey?: unknown
}

type RedaxiosConfig = {
  url?: string
  baseURL?: string
  method?: string
}

type ResponseLike = {
  url?: string
  status?: number
  statusText?: string
  config?: RedaxiosConfig
}

const isPosthogLoaded = () => Boolean((posthog as any)?.__loaded)

const toUpperCaseMethod = (method?: string) => method?.toUpperCase() ?? "GET"

const resolveAbsoluteUrl = (url?: string, baseURL?: string) => {
  if (!url) return undefined

  try {
    if (baseURL) {
      return new URL(url, baseURL).toString()
    }

    if (typeof window !== "undefined") {
      return new URL(url, window.location.origin).toString()
    }

    return new URL(url).toString()
  } catch (error) {
    console.warn("Failed to resolve API failure URL", error)
    return undefined
  }
}

const shouldTrackUrl = (resolvedUrl?: string) => {
  if (!resolvedUrl) return false

  try {
    const { hostname } = new URL(resolvedUrl)
    return TARGET_HOSTNAMES.has(hostname)
  } catch (error) {
    console.warn("Failed to parse URL for API failure tracking", error)
    return false
  }
}

const serializeKey = (key?: unknown) => {
  if (!key) return undefined

  try {
    return JSON.stringify(key)
  } catch {
    return String(key)
  }
}

const extractFromResponse = (error: unknown): ResponseLike | null => {
  if (!error || typeof error !== "object") return null

  const maybeResponse = error as Partial<ResponseLike>
  if (typeof maybeResponse.status !== "number" || !("url" in maybeResponse)) {
    return null
  }

  return {
    url: maybeResponse.url,
    status: maybeResponse.status,
    statusText: maybeResponse.statusText,
    config: maybeResponse.config,
  }
}

const extractFromAxiosError = (error: unknown): ResponseLike | null => {
  if (!error || typeof error !== "object") return null

  const maybeAxiosError = error as {
    response?: ResponseLike
    config?: RedaxiosConfig
    message?: string
  }

  if (!maybeAxiosError.response && !maybeAxiosError.config) {
    return null
  }

  return {
    url: maybeAxiosError.response?.url,
    status: maybeAxiosError.response?.status,
    statusText: maybeAxiosError.response?.statusText,
    config: maybeAxiosError.response?.config ?? maybeAxiosError.config,
  }
}

const captureApiFailure = (
  response: ResponseLike,
  error: unknown,
  context: FailureContext,
) => {
  if (!isPosthogLoaded()) return

  const resolvedUrl =
    resolveAbsoluteUrl(response.url, response.config?.baseURL) ??
    resolveAbsoluteUrl(response.config?.url, response.config?.baseURL)
  if (!shouldTrackUrl(resolvedUrl)) return

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : undefined

  posthog.capture("api_request_failed", {
    url: resolvedUrl,
    method: toUpperCaseMethod(response.config?.method),
    status: response.status,
    statusText: response.statusText,
    errorMessage,
    operationType: context.operationType,
    queryKey: serializeKey(context.queryKey),
    mutationKey: serializeKey(context.mutationKey),
    environment:
      typeof window !== "undefined" ? window.location.hostname : undefined,
  })
}

export const trackReactQueryApiFailure = (
  error: unknown,
  context: FailureContext,
) => {
  const response = extractFromResponse(error) ?? extractFromAxiosError(error)
  if (!response) return

  captureApiFailure(response, error, context)
}

import { readReferenceDesignSelection } from "@/lib/reference-design-selection"
import { useSyncExternalStore } from "react"

const subscribe = (onNavigate: () => void) => {
  window.addEventListener("popstate", onNavigate)
  window.addEventListener("hashchange", onNavigate)
  return () => {
    window.removeEventListener("popstate", onNavigate)
    window.removeEventListener("hashchange", onNavigate)
  }
}
const getLocation = () => window.location.search + window.location.hash

export function useReferenceDesignSelection() {
  return readReferenceDesignSelection(
    useSyncExternalStore(subscribe, getLocation, () => ""),
  )
}

import { useState, useEffect } from "react"

const getUrlParams = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const newParams: Record<string, string> = {}

  for (const [key, value] of searchParams.entries()) {
    newParams[key] = value
  }
  return newParams
}

export const useUrlParams = () => {
  const [params, setParams] = useState<Record<string, string>>(getUrlParams())

  useEffect(() => {
    const updateParams = () => {
      console.log("popstate")
      setParams(getUrlParams())
    }

    updateParams()

    window.addEventListener("popstate", updateParams)

    return () => {
      window.removeEventListener("popstate", updateParams)
    }
  }, [])

  return params
}

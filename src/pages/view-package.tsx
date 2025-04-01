import { useLocation } from "wouter"

export const ViewPackagePage = () => {
  // Get the current path and extract author/packageName
  const [location] = useLocation()
  const pathParts = location.split("/")
  const author = pathParts[2]
  const urlPackageName = pathParts[3]

  return "hello world"
}

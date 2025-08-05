import { useParams } from "wouter"

export default function ViewDeploymentPage() {
  const params = useParams<{ deploymentId: string }>()
  const deploymentId = params?.deploymentId || null

  return <div>{deploymentId}</div>
}

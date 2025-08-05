import { useParams } from "wouter"
import { DeploymentDashboard } from "@/components/deployment/DeploymentDashboard"
import { MOCK_DEPLOYMENTS } from "@/components/deployment/DeploymentCard"
import NotFoundPage from "./404"

export default function ViewDeploymentPage() {
  const params = useParams<{ deploymentId: string }>()
  const deploymentId = params?.deploymentId || null

  const selectedDeployment = deploymentId
    ? MOCK_DEPLOYMENTS.find((d) => d.package_build_id === deploymentId)
    : MOCK_DEPLOYMENTS[0]

  if (!selectedDeployment) {
    return <NotFoundPage heading="Deployment Not Found" />
  }

  return (
    <DeploymentDashboard
      projectName="tscircuit-project"
      deployments={MOCK_DEPLOYMENTS}
      selectedDeployment={selectedDeployment}
    />
  )
}

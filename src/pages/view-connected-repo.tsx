import { useParams } from "wouter"
import NotFoundPage from "./404"
import { ConnectedRepoDashboard, MOCK_DEPLOYMENTS } from "@/components/preview"

export default function ViewConnectedRepoOverview() {
  const params = useParams<{ buildId: string }>()
  const buildId = params?.buildId || null

  const selectedBuild = buildId
    ? MOCK_DEPLOYMENTS.find((d) => d.package_build_id === buildId)
    : MOCK_DEPLOYMENTS[0]

  if (!selectedBuild) {
    return <NotFoundPage heading="Build Not Found" />
  }

  return (
    <ConnectedRepoDashboard
      projectName="tscircuit-project"
      builds={MOCK_DEPLOYMENTS}
      selectedBuild={selectedBuild}
    />
  )
}

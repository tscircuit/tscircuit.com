import React from "react"
import { useParams } from "wouter"
import { useOrgByGithubHandle } from "@/hooks/use-org-by-github-handle"
import { OrganizationProfilePageContent } from "@/pages/organization-profile"
import { UserProfilePage } from "@/pages/user-profile"
import NotFoundPage from "@/pages/404"
import { FullPageLoader } from "@/App"

const ProfileRouter: React.FC = () => {
  const { username } = useParams()
  const {
    data: organization,
    isLoading,
    error,
  } = useOrgByGithubHandle(username || null)

  if (!username) {
    return <NotFoundPage heading="Username Not Provided" />
  }

  if (isLoading) {
    return <FullPageLoader />
  }

  if (organization && !organization.is_personal_org && !error) {
    return <OrganizationProfilePageContent org={organization} />
  }

  return <UserProfilePage />
}

export default ProfileRouter

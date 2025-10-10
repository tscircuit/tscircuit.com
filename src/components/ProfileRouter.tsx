import React from "react"
import { useParams } from "wouter"
import { OrganizationProfilePageContent } from "@/pages/organization-profile"
import { UserProfilePage } from "@/pages/user-profile"
import NotFoundPage from "@/pages/404"
import { FullPageLoader } from "@/App"
import { useOrgByName } from "@/hooks/use-org-by-org-name"

const ProfileRouter: React.FC = () => {
  const { username } = useParams()
  const {
    data: organization,
    isLoading,
    error,
  } = useOrgByName(username || null)

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

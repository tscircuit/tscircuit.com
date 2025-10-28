import React from "react"
import { useParams } from "wouter"
import { OrganizationProfilePageContent } from "@/pages/organization-profile"
import { UserProfilePage } from "@/pages/user-profile"
import NotFoundPage from "@/pages/404"
import { FullPageLoader } from "@/App"
import { useOrganization } from "@/hooks/use-organization"

const ProfileRouter: React.FC = () => {
  const { username } = useParams()
  const { organization, isLoading, error, isFetched } = useOrganization({
    orgName: username,
  })

  if (!username) {
    return <NotFoundPage heading="Username Not Provided" />
  }

  if (isLoading && !isFetched) {
    return <FullPageLoader />
  }

  if (organization && !organization.is_personal_org && !error) {
    return <OrganizationProfilePageContent org={organization} />
  }

  return <UserProfilePage />
}

export default ProfileRouter

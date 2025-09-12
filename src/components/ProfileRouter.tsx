import React from "react"
import { useParams } from "wouter"
import { useOrganizations } from "@/hooks/use-organizations"
import { OrganizationProfilePageContent } from "@/pages/organization-profile"
import { UserProfilePage } from "@/pages/user-profile"
import NotFoundPage from "@/pages/404"

const ProfileRouter: React.FC = () => {
  const { username } = useParams()
  const { getOrganizationByGithubHandle } = useOrganizations()

  if (!username) {
    return <NotFoundPage heading="Username Not Provided" />
  }

  const organization = getOrganizationByGithubHandle(username)
  if (organization) {
    return <OrganizationProfilePageContent org={organization} />
  }
  return <UserProfilePage />
}

export default ProfileRouter

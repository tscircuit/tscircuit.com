import { Account, Organization } from "fake-snippets-api/lib/db/schema"
import { useState, useCallback } from "react"
import { useGlobalStore } from "./use-global-store"

// Mock organizations data
export const mockOrganizations: Organization[] = [
  {
    org_id: "org_1",
    github_handle: "acme-corp",
    owner_account_id: "acc_1",
    is_personal_org: false,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    org_id: "org_2",
    github_handle: "circuit-labs",
    owner_account_id: "acc_2",
    is_personal_org: false,
    created_at: "2024-02-01T09:00:00Z",
  },
]
// Mock members data
export const mockMembers: Account[] = [
  {
    account_id: "member_1",
    github_username: "github",
  },
  {
    account_id: "member_2",
    github_username: "ghost",
  },
  {
    account_id: "member_3",
    github_username: "arnavk-09",
  },
]

export const useOrganizations = () => {
  const [organizations, setOrganizations] =
    useState<Organization[]>(mockOrganizations)
  const session = useGlobalStore((s) => s.session)

  const createOrganization = useCallback(
    async (
      org: Pick<Organization, "github_handle" | "is_personal_org">,
    ): Promise<Organization> => {
      const newOrganization: Organization = {
        ...org,
        owner_account_id: session!.account_id,
        org_id: `org_${organizations.length + 1}`,
        created_at: new Date().toISOString(),
      }

      setOrganizations((prev) => [...prev, newOrganization])
      return newOrganization
    },
    [],
  )

  const getOrganizationByGithubHandle = useCallback(
    (name: string): Organization | undefined => {
      return organizations.find((org) => org.github_handle === name)
    },
    [organizations],
  )

  const checkNameAvailability = useCallback(
    (name: string): boolean => {
      return !organizations.some((org) => org.github_handle === name)
    },
    [organizations],
  )

  return {
    checkNameAvailability,
    organizations,
    createOrganization,
    getOrganizationByGithubHandle,
  }
}

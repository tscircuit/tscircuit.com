import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("list snippets", async () => {
  const { axios, db } = await getTestServer()

  // Add some test snippets
  const snippets = [
    {
      unscoped_name: "Snippet1",
      owner_name: "testuser",
      code: "Content1",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      name: "testuser/Snippet1",
      snippet_type: "board",
    },
    {
      unscoped_name: "Snippet2",
      owner_name: "User2",
      code: "Content2",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
      name: "User2/Snippet2",
      snippet_type: "package",
    },
    {
      unscoped_name: "Snippet3",
      owner_name: "testuser",
      code: "Content3",
      created_at: "2023-01-03T00:00:00Z",
      updated_at: "2023-01-03T00:00:00Z",
      name: "testuser/Snippet3",
      snippet_type: "model",
    },
  ]

  for (const snippet of snippets) {
    db.addSnippet(snippet as any)
  }

  // Test without owner_name parameter
  const { data: allData } = await axios.get("/api/snippets/list")
  expect(allData.snippets).toHaveLength(3)

  // Test with owner_name parameter
  const { data: user1Data } = await axios.get("/api/snippets/list", {
    params: { owner_name: "testuser" },
  })
  expect(user1Data.snippets).toHaveLength(2)
  expect(
    user1Data.snippets.every(
      (snippet: { owner_name: string }) => snippet.owner_name === "testuser",
    ),
  ).toBe(true)

  // Test with non-existent owner
  const { data: nonExistentData } = await axios.get("/api/snippets/list", {
    params: { owner_name: "NonExistentUser" },
  })
  expect(nonExistentData.snippets).toHaveLength(0)
})

test("list snippets by owner", async () => {
  const { axios, db } = await getTestServer()

  // Create some test snippets
  const snippets = [
    {
      unscoped_name: "Snippet1",
      owner_name: "testuser",
      code: "Content1",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      name: "testuser/Snippet1",
      snippet_type: "board",
    },
    {
      unscoped_name: "Snippet2",
      owner_name: "otheruser",
      code: "Content2",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
      name: "otheruser/Snippet2",
      snippet_type: "package",
    },
  ]

  for (const snippet of snippets) {
    db.addSnippet(snippet as any)
  }

  // List snippets by owner
  const response = await axios.get("/api/snippets/list?owner_name=testuser")
  expect(response.status).toBe(200)
  expect(response.data.snippets).toHaveLength(1)
  expect(response.data.snippets[0].unscoped_name).toBe("Snippet1")
})

test("list starred snippets", async () => {
  const { axios, db } = await getTestServer()

  // Create some test snippets
  const snippets = [
    {
      unscoped_name: "Snippet1",
      owner_name: "testuser",
      code: "Content1",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      name: "testuser/Snippet1",
      snippet_type: "board",
    },
    {
      unscoped_name: "Snippet2",
      owner_name: "otheruser",
      code: "Content2",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
      name: "otheruser/Snippet2",
      snippet_type: "package",
    },
    {
      unscoped_name: "Snippet3",
      owner_name: "thirduser",
      code: "Content3",
      created_at: "2023-01-03T00:00:00Z",
      updated_at: "2023-01-03T00:00:00Z",
      name: "thirduser/Snippet3",
      snippet_type: "board",
    },
  ]

  const createdSnippets = []
  for (const snippet of snippets) {
    db.addSnippet(snippet as any)
    // Get the snippet from the database to get its ID
    const createdSnippet = db.packages.find(
      (p) => p.unscoped_name === snippet.unscoped_name,
    )
    if (!createdSnippet) throw new Error("Failed to create snippet")
    createdSnippets.push(createdSnippet)
  }

  // Add stars for testuser
  const testUserAccount = db.accounts.find(
    (acc) => acc.github_username === "testuser",
  )
  if (!testUserAccount) throw new Error("testuser account not found")

  // testuser stars Snippet2 and Snippet3
  db.addStar(testUserAccount.account_id, createdSnippets[1].package_id) // Snippet2
  db.addStar(testUserAccount.account_id, createdSnippets[2].package_id) // Snippet3

  // Create a different user for the Authorization header
  const otherUserAccount = db.addAccount({
    github_username: "otheruser",
    shippingInfo: {
      firstName: "Other",
      lastName: "User",
      companyName: "Other Company",
      address: "456 Other St",
      apartment: "Apt 7C",
      city: "Otherville",
      state: "CA",
      zipCode: "90001",
      country: "United States of America",
      phone: "555-987-6543",
    },
  })

  // List starred snippets for testuser
  const response = await axios.get("/api/snippets/list?starred_by=testuser", {
    headers: {
      Authorization: `Bearer ${otherUserAccount.account_id}`,
    },
  })
  expect(response.status).toBe(200)
  expect(response.data.snippets).toHaveLength(2)
  expect(
    response.data.snippets
      .map((s: { unscoped_name: string }) => s.unscoped_name)
      .sort(),
  ).toEqual(["Snippet2", "Snippet3"])

  // Verify star counts and is_starred flags
  for (const snippet of response.data.snippets as Array<{
    star_count: number
    is_starred: boolean
  }>) {
    expect(snippet.star_count).toBe(1)
    expect(snippet.is_starred).toBe(false) // Should be false because we're using otherUserAccount
  }
})

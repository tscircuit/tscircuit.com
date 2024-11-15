import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server";
import { test, expect } from "bun:test";

test("get star status of snippet", async () => {
  const { axios, db } = await getTestServer();

  // Add a test snippet
  const snippet = {
    unscoped_name: "TestSnippet",
    owner_name: "otheruser",
    code: "Test Content",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    name: "otheruser/TestSnippet",
    snippet_type: "package",
    description: "Test Description",
  };
  const addedSnippet = db.addSnippet(snippet as any)!;

  // Star the snippet
  await axios.post("/api/snippets/get_star", {
    snippet_id: addedSnippet.snippet_id,
  }, {
    headers: { Authorization: "Bearer 1234" },
  });

  // Remove star from snippet
  const response = await axios.post("/api/snippets/get_star", {
    snippet_id: addedSnippet.snippet_id,
  }, {
    headers: { Authorization: "Bearer 123" },
  });

  // Expectations
  expect(response.status).toBe(200);
  expect(response.data.ok).toBe(true);
  expect(response.data.is_starred).toBe(false);
  expect(db.hasStarred("account-123", addedSnippet.snippet_id)).toBe(false); // Verify in database
});

test("get star status of non-existent snippet", async () => {
  const { axios } = await getTestServer();

  // Attempt to star a non-existent snippet
  try {
    await axios.post("/api/snippets/get_star", {
      snippet_id: "non-existent-id",
    }, {
      headers: { Authorization: "Bearer 1234" },
    });
    expect(true).toBe(false); // This line should not be reached
  } catch (error: any) {
    expect(error.status).toBe(404);
    expect(error.data.error.message).toBe("Snippet not found");
  }
});

test("get star status of starred snippet", async () => {
  const { axios, db } = await getTestServer();

  // Add and star a test snippet
  const snippet = {
    unscoped_name: "TestSnippet",
    owner_name: "otheruser",
    code: "Test Content",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    name: "otheruser/TestSnippet",
    snippet_type: "package",
    description: "Test Description",
  };
  const addedSnippet = db.addSnippet(snippet as any);

  // Star the snippet
  await axios.post("/api/snippets/add_star", {
    snippet_id: addedSnippet.snippet_id,
  }, {
    headers: { Authorization: "Bearer 1234" },
  });

  // Retrieve star status
  const response = await axios.post("/api/snippets/get_star", {
    snippet_id: addedSnippet.snippet_id,
  }, {
    headers: { Authorization: "Bearer 1234" },
  });

  // Expectations
  expect(response.status).toBe(200);
  expect(response.data.ok).toBe(true);
  expect(response.data.is_starred).toBe(true);
});

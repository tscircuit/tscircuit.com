import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("quote destination can be normalized, persisted and cleared without becoming public", async () => {
  const { axios } = await getTestServer()
  expect(
    (await axios.get("/api/accounts/get_quote_preferences")).data
      .quote_preferences.destination_country_code,
  ).toBeNull()
  await axios.post("/api/accounts/update_quote_preferences", {
    destination_country_code: " ca ",
  })
  expect(
    (await axios.get("/api/accounts/get_quote_preferences")).data
      .quote_preferences.destination_country_code,
  ).toBe("CA")
  const own = await axios.get("/api/accounts/get")
  expect(own.data.account.quote_destination_country_code).toBeUndefined()
  await axios.post("/api/accounts/update_quote_preferences", {
    destination_country_code: null,
  })
  expect(
    (await axios.get("/api/accounts/get_quote_preferences")).data
      .quote_preferences.destination_country_code,
  ).toBeNull()
})

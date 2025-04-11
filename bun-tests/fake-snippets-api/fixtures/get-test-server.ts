import { afterEach } from "bun:test"
import defaultAxios from "redaxios"
import { startServer } from "./start-server"
import { DbClient } from "fake-snippets-api/lib/db/db-client"
import getPort from "get-port"

process.env.BUN_TEST = "true"
interface TestFixture {
  url: string
  server: any
  axios: typeof defaultAxios
  jane_axios: typeof defaultAxios
  unauthenticatedAxios: typeof defaultAxios
  db: DbClient
  seed: ReturnType<typeof seedDatabase>
}

export const getTestServer = async (): Promise<TestFixture> => {
  const port = await getPort()
  const testInstanceId = Math.random().toString(36).substring(2, 15)
  const testDbName = `testdb${testInstanceId}`

  const { server, db } = await startServer({
    port,
    testDbName,
  })

  const url = `http://127.0.0.1:${port}`
  const seed = seedDatabase(db)
  const axios = defaultAxios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${seed.account.account_id}`,
    },
  })
  const jane_axios = defaultAxios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${seed.account2.account_id}`,
    },
  })
  const unauthenticatedAxios = defaultAxios.create({
    baseURL: url,
  })

  afterEach(async () => {
    if (server && typeof server.stop === "function") {
      await server.stop()
    }
  })

  return {
    url,
    server,
    axios,
    jane_axios,
    unauthenticatedAxios,
    db,
    seed,
  }
}

const seedDatabase = (db: DbClient) => {
  const account = db.addAccount({
    github_username: "testuser",
    shippingInfo: {
      firstName: "Test",
      lastName: "User",
      companyName: "Test Company",
      address: "123 Test St",
      apartment: "Apt 4B",
      city: "Testville",
      state: "NY",
      zipCode: "10001",
      country: "United States of America",
      phone: "555-123-4567",
    },
  })
  const account2 = db.addAccount({
    github_username: "jane",
  })
  const order = db.addOrder({
    account_id: account.account_id,
    is_running: false,
    is_started: false,
    is_finished: false,
    error: null,
    has_error: false,
    circuit_json: [
      {
        type: "source_component",
        ftype: "simple_resistor",
        source_component_id: "source_component_1",
        name: "R1",
        resistance: "1k",
      },
    ],
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
  })

  return { account, order, account2 }
}

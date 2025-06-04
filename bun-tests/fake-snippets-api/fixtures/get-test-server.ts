import { afterEach } from "bun:test"
import defaultAxios from "redaxios"
import { startServer } from "./start-server"
import { DbClient } from "fake-snippets-api/lib/db/db-client"

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
  const testInstanceId = Math.random().toString(36).substring(2, 15)
  const testDbName = `testdb${testInstanceId}`

  const { server, db, port } = await startServer({
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

  // Seed a package release
  const packageRelease = db.addPackageRelease({
    package_id: "pkg_1",
    version: "0.0.1",
    created_at: new Date().toISOString(),
    is_latest: true,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
    display_status: "pending" as const,
    transpilation_display_status: "pending" as const,
    transpilation_in_progress: false,
    transpilation_logs: [],
    transpilation_started_at: null,
    transpilation_is_stale: false,
    circuit_json_build_display_status: "pending" as const,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: null,
    circuit_json_build_logs: [],
    circuit_json_build_is_stale: false,
    fs_sha: null,
    commit_sha: null,
  })

  return { account, account2, order, packageRelease }
}

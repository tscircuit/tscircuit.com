import { afterEach } from "bun:test"
import { tmpdir } from "node:os"
import defaultAxios from "redaxios"
import { startServer } from "./start-server"
import { DbClient } from "fake-snippets-api/lib/db/db-client"

interface TestFixture {
  url: string
  server: any
  axios: typeof defaultAxios
  db: DbClient
}

export const getTestServer = async (): Promise<TestFixture> => {
  const port = 3001 + Math.floor(Math.random() * 999)
  const testInstanceId = Math.random().toString(36).substring(2, 15)
  const testDbName = `testdb${testInstanceId}`

  const { server, db } = await startServer({
    port,
    testDbName,
  })

  const url = `http://127.0.0.1:${port}`
  const axios = defaultAxios.create({
    baseURL: url,
  })

  afterEach(async () => {
    if (server && typeof server.stop === "function") {
      await server.stop()
    }
    // Here you might want to add logic to drop the test database
  })

  return {
    url,
    server,
    axios,
    db,
  }
}

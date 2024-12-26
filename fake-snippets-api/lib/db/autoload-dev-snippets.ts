import axios from "redaxios"
import fs from "fs"
import path from "path"
import { DbClient } from "./db-client"

const extractTsciDependencies = (
  code: string,
): Array<{ owner: string; name: string }> => {
  const regex = /@tsci\/([^.]+)\.([^"'\s]+)/g
  const matches = Array.from(code.matchAll(regex))
  return matches.map((match) => ({
    owner: match[1],
    name: match[2],
  }))
}

const registryApi = axios.create({
  baseURL: "https://registry-api.tscircuit.com",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

const fetchSnippetFromRegistry = async (owner: string, name: string) => {
  const response = await registryApi.get(
    `/snippets/get?owner_name=${owner}&unscoped_name=${name}`,
  )
  return response.data.snippet
}

const loadSnippetWithDependencies = async (
  db: DbClient,
  owner: string,
  name: string,
  loadedSnippets = new Set<string>(),
) => {
  const snippetKey = `${owner}/${name}`
  if (loadedSnippets.has(snippetKey)) {
    return
  }

  try {
    const snippet = await fetchSnippetFromRegistry(owner, name)

    if (db.getSnippetByAuthorAndName(owner, name)) return

    db.addSnippet(snippet)
    loadedSnippets.add(snippetKey)

    const dependencies = extractTsciDependencies(snippet.code)
    for (const dep of dependencies) {
      loadSnippetWithDependencies(db, dep.owner, dep.name, loadedSnippets)
    }
  } catch (e) {
    console.error(`✗ Failed to load ${snippetKey}:`, e)
  }
}

export const loadAutoloadSnippets = async (db: DbClient) => {
  try {
    const autoloadPath = path.join(
      path.dirname(__dirname),
      "db",
      "autoload-snippets.json",
    )
    if (fs.existsSync(autoloadPath)) {
      const autoloadContent = JSON.parse(fs.readFileSync(autoloadPath, "utf8"))
      console.log("Loading development snippets from registry...")

      const loadedSnippets = new Set<string>()
      for (const snippetRef of autoloadContent.snippets) {
        loadSnippetWithDependencies(
          db,
          snippetRef.owner,
          snippetRef.name,
          loadedSnippets,
        )
      }
    }
  } catch (e) {
    console.error("Failed to load autoload-snippets.json:", e)
  }
}

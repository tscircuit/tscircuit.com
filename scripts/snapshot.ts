/*
 * This script is for selecting and updating a single snapshot.
 * We use prompts to allow the user to select the *.spec.ts file to run.
 * We then run "bunx playwright test --update-snapshots" for that file.
 */

import prompts from "prompts"
import { execSync } from "child_process"
import { Glob } from "bun"
import path from "path"

const run = async () => {
  const { file } = await prompts({
    type: "autocomplete",
    name: "file",
    message: "Select a file to update",
    choices: getTestFiles(),
  })

  if (!file) return

  execSync(`bunx playwright test --update-snapshots ${file}`, {
    stdio: "inherit",
  })
}

const getTestFiles = () => {
  const files = new Glob("playwright-tests/**/*.spec.ts").scanSync()
  return Array.from(files).map((file) => ({
    title: file.replace("playwright-tests/", ""),
    value: file,
  }))
}

run()

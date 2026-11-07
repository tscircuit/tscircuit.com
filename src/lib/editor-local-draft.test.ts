import { describe, expect, test } from "bun:test"
import {
  applyLocalDraft,
  createLocalDraft,
  getLocalDraftConflicts,
  getLocalDraftKey,
  parseLocalDraft,
} from "./editor-local-draft"

describe("editor local drafts", () => {
  test("stores only changed text files and deletions", () => {
    const draft = createLocalDraft(
      [
        { path: "index.tsx", content: "old" },
        { path: "README.md", content: "delete me" },
        { path: "image.png", content: "blob:old", isBinary: true },
      ],
      [
        { path: "index.tsx", content: "new" },
        { path: "added.tsx", content: "added" },
        { path: "image.png", content: "blob:old", isBinary: true },
      ],
    )

    expect(draft.version).toBe(1)
    expect(draft.changes).toEqual([
      { path: "index.tsx", before: "old", after: "new" },
      { path: "README.md", before: "delete me", after: null },
      { path: "added.tsx", before: null, after: "added" },
    ])
  })

  test("restores a draft while retaining unrelated server changes", () => {
    const draft = createLocalDraft(
      [{ path: "index.tsx", content: "old" }],
      [{ path: "index.tsx", content: "draft" }],
    )
    const serverFiles = [
      { path: "index.tsx", content: "old" },
      { path: "README.md", content: "new on server" },
    ]

    expect(getLocalDraftConflicts(serverFiles, draft)).toEqual([])
    expect(applyLocalDraft(serverFiles, draft)).toEqual([
      { path: "index.tsx", content: "draft" },
      { path: "README.md", content: "new on server" },
    ])
    expect(serverFiles[0].content).toBe("old")
  })

  test("detects a server edit to the same file before restoration", () => {
    const draft = createLocalDraft(
      [{ path: "index.tsx", content: "old" }],
      [{ path: "index.tsx", content: "draft" }],
    )
    expect(
      getLocalDraftConflicts([{ path: "index.tsx", content: "server" }], draft),
    ).toEqual(["index.tsx"])
  })

  test("rejects changed binary files rather than pretending they were saved", () => {
    expect(() =>
      createLocalDraft(
        [{ path: "board.png", content: "blob:old", isBinary: true }],
        [{ path: "board.png", content: "blob:new", isBinary: true }],
      ),
    ).toThrow("Cannot store binary changes in a browser draft: board.png")
  })

  test("rejects invalid saved drafts instead of silently discarding them", () => {
    expect(() => parseLocalDraft('{"version":1,"changes":[{}]}')).toThrow()
  })

  test("separates drafts by account, package, and release", () => {
    expect(
      getLocalDraftKey({
        accountId: "account-a",
        packageId: "package-1",
        releaseId: "release-1",
      }),
    ).not.toBe(
      getLocalDraftKey({
        accountId: "account-b",
        packageId: "package-1",
        releaseId: "release-1",
      }),
    )
  })
})

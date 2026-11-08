import { expect, test } from "bun:test"
import {
  draftFingerprint,
  localDraftKey,
  readLocalDraft,
  snapshotEditableFiles,
  writeLocalDraft,
} from "../src/lib/local-draft-storage"

function fakeStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear() {
      data.clear()
    },
    getItem(key: string) {
      return data.get(key) ?? null
    },
    key(index: number) {
      return [...data.keys()][index] ?? null
    },
    removeItem(key: string) {
      data.delete(key)
    },
    setItem(key: string, value: string) {
      data.set(key, value)
    },
  }
}

test("local draft persists source and manual edits without build requests", () => {
  const storage = fakeStorage()
  const key = localDraftKey("account-1", "package:123")
  const files = snapshotEditableFiles([
    { path: "index.tsx", content: "new code" },
    { path: "manual-edits.json", content: "{}" },
    { path: "bun.lock", content: "generated" },
    { path: "assets/image.png", content: "blob:fake", isBinary: true },
  ])
  const draft = writeLocalDraft(storage, key, files)
  expect(draft.files).toHaveLength(2)
  expect(readLocalDraft(storage, key)?.files).toEqual(files)
  expect(draftFingerprint(readLocalDraft(storage, key)!.files)).toBe(
    draftFingerprint(files),
  )
})

test("drafts from separate accounts and packages cannot overwrite each other", () => {
  const storage = fakeStorage()
  const first = localDraftKey("account-a", "package:1")
  const second = localDraftKey("account-b", "package:1")
  const third = localDraftKey("account-a", "package:2")
  writeLocalDraft(storage, first, [{ path: "index.tsx", content: "first" }])
  writeLocalDraft(storage, second, [{ path: "index.tsx", content: "second" }])
  writeLocalDraft(storage, third, [{ path: "index.tsx", content: "third" }])
  expect(readLocalDraft(storage, first)?.files[0].content).toBe("first")
  expect(readLocalDraft(storage, second)?.files[0].content).toBe("second")
  expect(readLocalDraft(storage, third)?.files[0].content).toBe("third")
})

test("invalid stored drafts are reported rather than overwritten", () => {
  const storage = fakeStorage()
  storage.setItem("broken", "{invalid")
  expect(() => readLocalDraft(storage, "broken")).toThrow()
  expect(storage.getItem("broken")).toBe("{invalid")
})

test("quota failure does not make autosave look successful", () => {
  const storage = fakeStorage()
  storage.setItem = () => {
    throw new Error("QuotaExceededError")
  }
  expect(() =>
    writeLocalDraft(storage, "draft", [
      { path: "index.tsx", content: "latest" },
    ]),
  ).toThrow("QuotaExceededError")
  expect(storage.getItem("draft")).toBeNull()
})

test("oversized snapshots are rejected before writing", () => {
  const storage = fakeStorage()
  expect(() =>
    writeLocalDraft(storage, "draft", [
      { path: "index.tsx", content: "a".repeat(2_000_001) },
    ]),
  ).toThrow("2 MB")
  expect(storage.getItem("draft")).toBeNull()
})

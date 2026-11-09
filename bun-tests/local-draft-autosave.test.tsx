import { afterEach, beforeEach, expect, spyOn, test } from "bun:test"
import { Window } from "happy-dom"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { useLocalDraftAutosave } from "../src/hooks/use-local-draft-autosave"
import { localDraftKey, readLocalDraft } from "../src/lib/local-draft-storage"
import type { PackageFile } from "../src/types/package"

const files = (content: string): PackageFile[] => [
  { path: "index.tsx", content },
]
const key = localDraftKey("account-1", "package:1")
let browser: Window
let root: Root | undefined
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document")
const originalAct = Object.getOwnPropertyDescriptor(
  globalThis,
  "IS_REACT_ACT_ENVIRONMENT",
)

beforeEach(() => {
  browser = new Window({ url: "http://localhost" })
  Object.defineProperties(globalThis, {
    window: { value: browser, configurable: true, writable: true },
    document: { value: browser.document, configurable: true, writable: true },
    IS_REACT_ACT_ENVIRONMENT: {
      value: true,
      configurable: true,
      writable: true,
    },
  })
})

afterEach(async () => {
  await act(async () => root?.unmount())
  root = undefined
  await browser.happyDOM.close()
  for (const [name, descriptor] of [
    ["window", originalWindow],
    ["document", originalDocument],
    ["IS_REACT_ACT_ENVIRONMENT", originalAct],
  ] as const) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    else Reflect.deleteProperty(globalThis, name)
  }
})

async function mount() {
  let result!: ReturnType<typeof useLocalDraftAutosave>
  let props: Parameters<typeof useLocalDraftAutosave>[0] = {
    accountId: "account-1",
    projectId: "package:1",
    ready: true,
    files: files("A"),
    initialFiles: files("A"),
    onRestore: (restored) => {
      props = { ...props, files: restored }
      root!.render(createElement(Hook))
    },
  }
  function Hook() {
    result = useLocalDraftAutosave(props)
    return null
  }
  const container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root!.render(createElement(Hook)))
  return {
    get current() {
      return result
    },
    get currentFiles() {
      return props.files
    },
    async update(next: Partial<typeof props>) {
      await act(async () => {
        props = { ...props, ...next }
        root!.render(createElement(Hook))
      })
    },
  }
}

async function waitForAutosave() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1600))
  })
}

test("edits back to the original code survive after a successful manual save", async () => {
  const hook = await mount()
  await hook.update({ files: files("B") })
  await waitForAutosave()
  // The server now stores B, so A must be treated as an unsaved edit.
  await hook.update({ initialFiles: files("B") })
  await hook.update({ files: files("A") })
  await waitForAutosave()
  expect(readLocalDraft(window.localStorage, key)?.files).toEqual(files("A"))
  expect(hook.current.status).toBe("saved")
})

test.each(["remove", "clear"])(
  "another tab's %s stops reporting a persisted draft",
  async (operation) => {
    const hook = await mount()
    await hook.update({ files: files("B") })
    await waitForAutosave()
    if (operation === "clear") window.localStorage.clear()
    else window.localStorage.removeItem(key)
    await act(async () => {
      browser.dispatchEvent(
        new browser.StorageEvent("storage", {
          ...(operation === "remove" ? { key } : {}),
          storageArea: browser.localStorage,
        }),
      )
    })
    expect(hook.current.status).toBe("conflict")
    expect(hook.current.error).toBeTruthy()
    // Do not silently replace a draft another tab deliberately discarded.
    await hook.update({ files: files("C") })
    await waitForAutosave()
    expect(window.localStorage.getItem(key)).toBeNull()
  },
)

test("disabling cancels a pending write and re-enabling saves the latest files", async () => {
  const hook = await mount()
  await hook.update({ files: files("B") })
  await act(async () => hook.current.changeEnabled(false))
  await waitForAutosave()
  expect(window.localStorage.getItem(key)).toBeNull()
  await act(async () => hook.current.changeEnabled(true))
  await waitForAutosave()
  expect(readLocalDraft(window.localStorage, key)?.files).toEqual(files("B"))
})

test("reload recovery preserves added, renamed and deleted files", async () => {
  const hook = await mount()
  const changed = [
    { path: "manual-edits.json", content: "{}" },
    { path: "new.tsx", content: "new" },
    { path: "renamed.tsx", content: "renamed" },
  ]
  await hook.update({ files: changed })
  await waitForAutosave()
  await act(async () => root!.unmount())
  const reopened = await mount()
  expect(reopened.current.status).toBe("restore")
  await act(async () => reopened.current.restoreDraft())
  expect(reopened.currentFiles).toEqual(changed)
  expect(reopened.current.status).toBe("saved")
})

test("project and account switches preserve separate drafts", async () => {
  const hook = await mount()
  await hook.update({ files: files("B") })
  await waitForAutosave()
  await hook.update({
    projectId: "package:2",
    files: files("C"),
    initialFiles: files("C"),
  })
  await hook.update({ files: files("D") })
  await waitForAutosave()
  expect(readLocalDraft(window.localStorage, key)?.files).toEqual(files("B"))
  expect(
    readLocalDraft(window.localStorage, localDraftKey("account-1", "package:2"))
      ?.files,
  ).toEqual(files("D"))
  await hook.update({
    accountId: "account-2",
    files: files("C"),
    initialFiles: files("C"),
  })
  expect(hook.current.restoreCandidate).toBeNull()
})

test("quota errors never report Saved", async () => {
  const hook = await mount()
  const write = spyOn(browser.Storage.prototype, "setItem").mockImplementation(
    () => {
      throw new Error("QuotaExceededError")
    },
  )
  await hook.update({ files: files("B") })
  await waitForAutosave()
  write.mockRestore()
  expect(hook.current.status).toBe("error")
  expect(hook.current.error).toBe("QuotaExceededError")
  expect(window.localStorage.getItem(key)).toBeNull()
})

test("other-tab changes block an already pending autosave", async () => {
  const hook = await mount()
  await hook.update({ files: files("B") })
  await act(async () => {
    browser.dispatchEvent(
      new browser.StorageEvent("storage", {
        key,
        storageArea: browser.localStorage,
      }),
    )
  })
  await waitForAutosave()
  expect(hook.current.status).toBe("conflict")
  expect(window.localStorage.getItem(key)).toBeNull()
})

test("unrelated storage events do not interrupt autosave", async () => {
  const hook = await mount()
  await hook.update({ files: files("B") })
  await act(async () => {
    browser.dispatchEvent(
      new browser.StorageEvent("storage", {
        key: "unrelated",
        storageArea: browser.localStorage,
      }),
    )
    browser.dispatchEvent(
      new browser.StorageEvent("storage", {
        key,
        storageArea: browser.sessionStorage,
      }),
    )
  })
  await waitForAutosave()
  expect(hook.current.status).toBe("saved")
  expect(readLocalDraft(window.localStorage, key)?.files).toEqual(files("B"))
})

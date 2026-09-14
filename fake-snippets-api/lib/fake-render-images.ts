import type { DbClient } from "./db/db-client"
import { z } from "zod"
import sharp from "sharp"

export const renderParams = z.object({
  package_release_id: z.string(),
  angle: z.enum(["angled", "top", "bottom"]).default("angled"),
})
type Params = z.infer<typeof renderParams>
type Job = Params & {
  package_release_render_image_id: string
  circuit_json_file_path: string
  created: number
}
const stores = new WeakMap<DbClient, Map<string, Job>>()
export function renderStore(db: DbClient) {
  if (!stores.has(db)) stores.set(db, new Map())
  return stores.get(db)!
}
export const renderKey = (p: Params) => `${p.package_release_id}:${p.angle}`
export function getRenderPackage(db: DbClient, id: string) {
  const release = db.packageReleases.find((r) => r.package_release_id === id)
  return db.packages.find((p) => p.package_id === release?.package_id)
}
export function publicRender(job: Job) {
  const elapsed = Date.now() - job.created
  const done =
    elapsed >= 12000 + ["angled", "top", "bottom"].indexOf(job.angle) * 2000
  return {
    package_release_render_image_id: job.package_release_render_image_id,
    package_release_id: job.package_release_id,
    angle: job.angle,
    circuit_json_file_path: job.circuit_json_file_path,
    status: done
      ? "succeeded"
      : elapsed < 2000
        ? "queued"
        : elapsed < 4000
          ? "submitting"
          : "running",
    created_at: new Date(job.created).toISOString(),
    completed_at: done
      ? new Date(
          job.created +
            12000 +
            ["angled", "top", "bottom"].indexOf(job.angle) * 2000,
        ).toISOString()
      : null,
    error: null,
    image_url: done
      ? `/package_releases/get_render_image_file?package_release_id=${job.package_release_id}&angle=${job.angle}`
      : null,
    file_path: done ? `dist/render/${job.angle}.png` : null,
  }
}
export async function fakeRenderPng(angle: Params["angle"]) {
  // A deliberately labeled sample, not a Blender/AI render of the submitted circuit.
  const transform =
    angle === "angled"
      ? "translate(80 105) rotate(-12 220 135) skewX(-12)"
      : angle === "bottom"
        ? "translate(80 90) translate(440 0) scale(-1 1)"
        : "translate(80 90)"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500"><rect width="600" height="500" fill="#f7f8fa"/><g transform="${transform}"><rect x="5" y="10" width="440" height="270" rx="25" fill="#d4d9d7"/><rect width="440" height="270" rx="25" fill="#17644c" stroke="#a6ad78" stroke-width="5"/>${[
    [30, 30],
    [410, 30],
    [30, 240],
    [410, 240],
  ]
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="14" fill="#caba6c"/><circle cx="${x}" cy="${y}" r="7" fill="#f7f8fa"/>`,
    )
    .join(
      "",
    )}<path d="M45 80H180V185H385M95 230V135H350V50" fill="none" stroke="#438a63" stroke-width="4"/>${angle !== "bottom" ? '<rect x="175" y="75" width="100" height="100" rx="5" fill="#242b2d"/><rect x="40" y="130" width="70" height="58" rx="8" fill="#939c9f"/><circle cx="345" cy="180" r="32" fill="#343c40"/><circle cx="345" cy="180" r="24" fill="#a7adaf"/>' : '<path d="M110 60V210H310V100H160" fill="none" stroke="#a7ad60" stroke-width="5"/>'}</g><text x="300" y="438" text-anchor="middle" font-family="sans-serif" font-size="21" fill="#273d36">${angle.toUpperCase()} · SAMPLE IMAGE</text><text x="300" y="467" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#66766f">Fake server — no Blender or AI request</text></svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

export function canReadFakeRender(
  db: DbClient,
  pkg: NonNullable<ReturnType<typeof getRenderPackage>>,
  accountId?: string,
) {
  if (!pkg.is_private || pkg.public_dist_enabled) return true
  if (!accountId) return false
  return (
    pkg.creator_account_id === accountId ||
    db.accounts.some(
      (a) =>
        a.account_id === accountId && a.personal_org_id === pkg.owner_org_id,
    ) ||
    db.orgAccounts.some(
      (m) => m.account_id === accountId && m.org_id === pkg.owner_org_id,
    )
  )
}

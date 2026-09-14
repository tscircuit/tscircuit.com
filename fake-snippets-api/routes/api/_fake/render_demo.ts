import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { renderStore } from "fake-snippets-api/lib/fake-render-images"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  rawResponse: true,
})(async (req, ctx) => {
  const pkg = ctx.db.packages.find((p) => p.name === "testuser/my-test-board")!
  const release = ctx.db.packageReleases.find(
    (r) => r.package_id === pkg.package_id && r.is_latest,
  )!
  if (
    !ctx.db.packageFiles.some(
      (f) =>
        f.package_release_id === release.package_release_id &&
        f.file_path === "dist/circuit.json",
    )
  )
    ctx.db.addPackageFile({
      package_release_id: release.package_release_id,
      file_path: "dist/circuit.json",
      content_text: JSON.stringify([
        {
          type: "pcb_board",
          pcb_board_id: "demo-board",
          width: 40,
          height: 30,
          center: { x: 0, y: 0 },
        },
      ]),
      created_at: new Date().toISOString(),
      is_text: true,
    })
  for (const [key, job] of renderStore(ctx.db))
    if (job.package_release_id === release.package_release_id)
      renderStore(ctx.db).delete(key)
  return new Response(
    `<!doctype html><html><head><title>Local render demo</title></head><body><p id="status">Starting the fake-server demo…</p><script>
  (async () => {
    const response = await fetch('/api/internal/sessions/create_without_auth', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({account_id:'account-1234'})});
    if (!response.ok) throw new Error('Could not start demo session');
    const {session} = await response.json();
    localStorage.setItem('session_store', JSON.stringify({state:{session:{...session,github_username:'testuser',tscircuit_handle:'testuser'}},version:0}));
    location.replace('/testuser/my-test-board/settings?tab=renders');
  })().catch(error => document.getElementById('status').textContent=error.message);
  </script></body></html>`,
    { headers: { "Content-Type": "text/html", "Cache-Control": "no-store" } },
  )
})

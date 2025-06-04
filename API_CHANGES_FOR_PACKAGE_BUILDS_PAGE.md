# API Changes Required for Package Builds Page

## Overview

The PackageBuildsPage components require schema modifications to the existing package release object to support package build/deployment details and build logs. This document outlines the necessary changes to the fake-snippets-api.

## Schema Changes Required

### 1. Update Package Release Schema

Modify the existing `packageReleaseSchema` in `/fake-snippets-api/lib/db/schema.ts` to include build-related fields:

```typescript
export const packageReleaseSchema = z.object({
  // ... existing fields
  
  // Build Status and Display
  display_status: z.enum(["pending", "building", "successful", "failed"]).default("pending"),
  total_build_duration_ms: z.number().nullable().optional(),
  
  // Transpilation Process
  transpilation_display_status: z.enum(["pending", "building", "successful", "failed"]).default("pending"),
  transpilation_in_progress: z.boolean().default(false),
  transpilation_started_at: z.string().datetime().nullable().optional(),
  transpilation_completed_at: z.string().datetime().nullable().optional(),
  transpilation_logs: z.array(z.any()).default([]),
  transpilation_is_stale: z.boolean().default(false),
  
  // Circuit JSON Build Process  
  circuit_json_build_display_status: z.enum(["pending", "building", "successful", "failed"]).default("pending"),
  circuit_json_build_in_progress: z.boolean().default(false),
  circuit_json_build_started_at: z.string().datetime().nullable().optional(),
  circuit_json_build_completed_at: z.string().datetime().nullable().optional(),
  circuit_json_build_logs: z.array(z.any()).default([]),
  circuit_json_build_is_stale: z.boolean().default(false),
})

## New API Endpoints Required

### 1. Rebuild Package Release Endpoint

**File**: `/fake-snippets-api/routes/api/package_releases/rebuild.ts`

```typescript
export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_release_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_release: packageReleaseSchema,
  }),
})
```

## Modifications to Existing Endpoints

### 1. Update Package Release Public Mapping

Modify `/fake-snippets-api/lib/public-mapping/public-map-package-release.ts` to include the new build-related fields:

```typescript
export const publicMapPackageRelease = (
  internal_package_release: ZT.PackageRelease,
): ZT.PackageRelease => {
  return {
    ...internal_package_release,
    // Include new build-related fields
    display_status: internal_package_release.display_status,
    total_build_duration_ms: internal_package_release.total_build_duration_ms,
    transpilation_display_status: internal_package_release.transpilation_display_status,
    transpilation_in_progress: internal_package_release.transpilation_in_progress,
    transpilation_started_at: internal_package_release.transpilation_started_at,
    transpilation_completed_at: internal_package_release.transpilation_completed_at,
    transpilation_logs: internal_package_release.transpilation_logs,
    transpilation_is_stale: internal_package_release.transpilation_is_stale,
    circuit_json_build_display_status: internal_package_release.circuit_json_build_display_status,
    circuit_json_build_in_progress: internal_package_release.circuit_json_build_in_progress,
    circuit_json_build_started_at: internal_package_release.circuit_json_build_started_at,
    circuit_json_build_completed_at: internal_package_release.circuit_json_build_completed_at,
    circuit_json_build_logs: internal_package_release.circuit_json_build_logs,
    circuit_json_build_is_stale: internal_package_release.circuit_json_build_is_stale,
  }
}
```

## Database Helper Methods

Add these methods to `/fake-snippets-api/lib/db/db-client.ts`:

```typescript
export interface DbClient {
  // ... existing methods
  triggerPackageReleaseRebuild(packageReleaseId: string): PackageRelease | undefined
}
```

## Data Requirements from Components

Based on the PackageBuildsPage components analysis:

### DeploymentDetailsPanel Requirements:
- Package release creator information (account/user data) - `creator_account_id`
- Build creation timestamp - `created_at`
- Build status display - `display_status` (pending/building/successful/failed)
- Individual process status - `transpilation_display_status`, `circuit_json_build_display_status`
- Build duration - `total_build_duration_ms`
- Version information - `version`
- Commit SHA - `commit_sha`
- Staleness indicators - `transpilation_is_stale`, `circuit_json_build_is_stale`

### BuildPreviewContent Requirements:
- Preview images can be generated from existing circuit JSON data
- No new artifact storage needed

### CollapsibleSection Requirements:
- Transpilation logs - `transpilation_logs` array of objects (typically `{ msg: "..." }`)
- Circuit JSON build logs - `circuit_json_build_logs` array of objects (typically `{ msg: "..." }`)
- Process timestamps - `transpilation_started_at`, `transpilation_completed_at`, `circuit_json_build_started_at`, `circuit_json_build_completed_at`
- Process durations can be calculated from start/end timestamps

### DeploymentHeader Requirements:
- Package information (author, name) - from existing package data
- Download functionality - uses existing circuit JSON and generated files

## Implementation Priority

1. **High Priority**: Schema changes to package release object
2. **Medium Priority**: Rebuild endpoint for manual retries
3. **Low Priority**: Advanced build status tracking and real-time updates

## Notes

- All build-related data is stored directly on the package release object for simplicity
- Build logs are stored as arrays of any object for flexible log entry formats (typically `{ msg: "..." }`)
- Transpilation and circuit JSON builds are tracked as separate processes with their own timing, logs, and status
- Each process has its own `display_status` (pending/building/successful/failed) for granular tracking
- Staleness tracking (`transpilation_is_stale`, `circuit_json_build_is_stale`) indicates when builds need to be re-run
- Status changed from "ready" to "successful" for clearer semantics
- **Build processes start automatically when files change** - no manual trigger endpoints needed
- **Logs and status updates are generated internally** by the build system
- Only a rebuild endpoint is needed for manual retry functionality
- No separate artifact storage - leverage existing circuit JSON and file generation capabilities
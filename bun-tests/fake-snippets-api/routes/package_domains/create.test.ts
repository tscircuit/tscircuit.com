import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("create package domain pointing to package_release", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-domain-pkg",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseRes.data.package_release

  const res = await axios.post("/api/package_domains/create", {
    points_to: "package_release",
    package_release_id: release.package_release_id,
    fully_qualified_domain_name: "my-component.example.com",
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_domain.points_to).toBe("package_release")
  expect(res.data.package_domain.package_release_id).toBe(
    release.package_release_id,
  )
  expect(res.data.package_domain.package_build_id).toBeNull()
  expect(res.data.package_domain.package_id).toBeNull()
  expect(res.data.package_domain.tag).toBeNull()
  expect(res.data.package_domain.fully_qualified_domain_name).toBe(
    "my-component.example.com",
  )
  expect(res.data.package_domain.package_domain_id).toBeDefined()
  expect(res.data.package_domain.created_at).toBeDefined()
})

test("create package domain pointing to package_build", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-domain-build",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseRes.data.package_release

  const build = db.addPackageBuild({
    package_release_id: release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_logs: [],
    circuit_json_build_logs: [],
    build_error_last_updated_at: new Date().toISOString(),
  })

  const res = await axios.post("/api/package_domains/create", {
    points_to: "package_build",
    package_build_id: build.package_build_id,
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_domain.points_to).toBe("package_build")
  expect(res.data.package_domain.package_build_id).toBe(build.package_build_id)
  expect(res.data.package_domain.package_release_id).toBeNull()
  expect(res.data.package_domain.package_id).toBeNull()
})

test("create package domain pointing to package_release_with_tag", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-domain-tag",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseRes.data.package_release

  const res = await axios.post("/api/package_domains/create", {
    points_to: "package_release_with_tag",
    package_release_id: release.package_release_id,
    tag: "v1.0.0",
    fully_qualified_domain_name: "v1.my-component.example.com",
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_domain.points_to).toBe("package_release_with_tag")
  expect(res.data.package_domain.package_release_id).toBe(
    release.package_release_id,
  )
  expect(res.data.package_domain.tag).toBe("v1.0.0")
  expect(res.data.package_domain.package_build_id).toBeNull()
  expect(res.data.package_domain.package_id).toBeNull()
})

test("create package domain pointing to package", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-domain-package",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const res = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "pkg.example.com",
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_domain.points_to).toBe("package")
  expect(res.data.package_domain.package_id).toBe(pkg.package_id)
  expect(res.data.package_domain.package_release_id).toBeNull()
  expect(res.data.package_domain.package_build_id).toBeNull()
  expect(res.data.package_domain.tag).toBeNull()
})

test("create package domain - missing required package_release_id", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_domains/create", {
      points_to: "package_release",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("missing_package_release_id")
  }
})

test("create package domain - missing required package_build_id", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_domains/create", {
      points_to: "package_build",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("missing_package_build_id")
  }
})

test("create package domain - missing required package_id", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_domains/create", {
      points_to: "package",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("missing_package_id")
  }
})

test("create package domain - missing params for package_release_with_tag", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_domains/create", {
      points_to: "package_release_with_tag",
      package_release_id: "some-id",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("missing_params")
  }
})

test("create package domain - invalid extra params", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-domain-invalid",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseRes.data.package_release

  try {
    await axios.post("/api/package_domains/create", {
      points_to: "package_release",
      package_release_id: release.package_release_id,
      package_build_id: "should-not-be-here",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("invalid_params")
  }
})

test("create package domain - duplicate FQDN", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-domain-dup",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseRes.data.package_release

  await axios.post("/api/package_domains/create", {
    points_to: "package_release",
    package_release_id: release.package_release_id,
    fully_qualified_domain_name: "unique-domain.example.com",
  })

  try {
    await axios.post("/api/package_domains/create", {
      points_to: "package",
      package_id: pkg.package_id,
      fully_qualified_domain_name: "unique-domain.example.com",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("domain_fqdn_exists")
  }
})

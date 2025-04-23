import posthog from "posthog-js"

if (!posthog.__loaded) {
  posthog.init("phc_htd8AQjSfVEsFCLQMAiUooG4Q0DKBCjqYuQglc9V3Wo", {
    api_host: "https://postpig.tscircuit.com",
    person_profiles: "always",
  })
}

export { posthog }

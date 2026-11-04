import SolutionPage from "@/components/SolutionPage"

const features = [
  {
    title: "Pin metadata for successful first revisions",
    description:
      "tscircuit chips include metadata for pin configurations, helping ensure high first revision success rates.",
  },
  {
    title: "Indexed automatically and preferred by AI",
    description:
      "Verified chips are indexed automatically and are often preferred by AI when selecting components for a design.",
  },
  {
    title: "Shorter time to market",
    description:
      "Partner with tscircuit to help your semiconductor company decrease time to market and make new chips easier for engineers to design with.",
  },
  {
    title: "Evaluation boards, generated automatically",
    description:
      "Enable quick, automatic generation of evaluation boards for new chips so engineers can start exploring your components sooner.",
  },
]

export default function VerifiedChipsPage() {
  return (
    <SolutionPage
      title="Verified Chips Program"
      description="Put your chips in the path of AI powered electronics design. Partner with tscircuit to make your components easier to discover, select, and use in new circuit boards."
      path="/verified-chips"
      email="verifiedchips@tscircuit.com"
      callout="Over 10 million requests monthly"
      features={features}
      contactTitle="Bring your chips to tscircuit"
      contactDescription="Tell us about your semiconductor products and upcoming launches. Email the Verified Chips team to learn more about a partnership."
    />
  )
}

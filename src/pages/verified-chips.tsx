import SolutionPage from "@/components/SolutionPage"

const features = [
  {
    title: "Better Validation for AI-generated Circuit Boards",
    description:
      "Verified pin metadata helps validate component connections in AI-generated circuit boards and catch configuration errors before fabrication.",
  },
  {
    title: "Component discovery in AI design workflows",
    description:
      "Verified components are automatically indexed, making them easier for AI tools and engineers to discover and select for new designs.",
  },
  {
    title: "Accelerate component design-in",
    description:
      "Support applications engineering and product launches with verified component data that helps engineers move from component selection to board design.",
  },
  {
    title: "Automated evaluation board generation",
    description:
      "Generate evaluation boards for new components to streamline device evaluation and accelerate engineering development.",
  },
]

export default function VerifiedChipsPage() {
  return (
    <SolutionPage
      title="Verified Chips Program"
      description="Bring verified semiconductor components into AI-powered electronics design. Partner with tscircuit to improve circuit board validation, component discovery, and design-in across engineering workflows."
      path="/verified-chips"
      email="verifiedchips@tscircuit.com"
      callout="Over 10 million requests monthly"
      features={features}
      contactTitle="Discuss a Verified Chips partnership"
      contactDescription="Connect with the Verified Chips team to discuss component portfolios, upcoming product introductions, and integration with AI-powered design workflows."
    />
  )
}

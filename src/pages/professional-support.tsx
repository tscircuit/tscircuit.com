import SolutionPage from "@/components/SolutionPage"

const features = [
  {
    title: "Design reviews from electronics engineers",
    description:
      "Have your circuit designs reviewed by tscircuit electronics engineers, with feedback to help you move toward your next board revision.",
  },
  {
    title: "Dedicated Slack and email channels",
    description:
      "Work directly with the tscircuit team through dedicated Slack and email channels for your design questions and support needs.",
  },
  {
    title: "Custom optimized autorouting",
    description:
      "Get custom autorouting solutions optimized for your boards and routing requirements.",
  },
  {
    title: "Access to internal PCB design models",
    description:
      "Use tscircuit’s internal models for PCB design as part of your supported design workflow.",
  },
  {
    title: "Early access to signal analysis",
    description:
      "Get beta access to new features for signal integrity and high speed signal analysis.",
  },
]

export default function ProfessionalSupportPage() {
  return (
    <SolutionPage
      title="Professional Support"
      description="Bring tscircuit electronics engineers into your design workflow. Get expert design reviews, direct support, and tools tailored to your PCB design needs."
      path="/professional-support"
      email="sales@tscircuit.com"
      callout="Starting at $500/mo"
      features={features}
      contactTitle="Talk to us about your next board"
      contactDescription="Tell us about your team, your design requirements, and where you need support. Email our sales team to learn more about Professional Support."
    />
  )
}

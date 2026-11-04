import { ArrowRight, Check } from "lucide-react"
import { Helmet } from "react-helmet-async"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

type SolutionPageProps = {
  title: string
  description: string
  path: string
  email: string
  features: { title: string; description: string }[]
  callout: string
  contactTitle: string
  contactDescription: string
}

export default function SolutionPage({
  title,
  description,
  path,
  email,
  features,
  callout,
  contactTitle,
  contactDescription,
}: SolutionPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>{title} — tscircuit</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://tscircuit.com${path}`} />
      </Helmet>
      <Header />
      <main className="flex-grow mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <section aria-labelledby="solution-title" className="max-w-3xl">
          <p className="text-sm font-medium text-blue-600">Solutions</p>
          <h1
            id="solution-title"
            className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl"
          >
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">{description}</p>
          <p className="mt-6 text-lg font-semibold text-gray-900">{callout}</p>
          <a
            href={`mailto:${email}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </section>
        <section
          aria-label={`${title} benefits`}
          className="mt-16 grid gap-x-12 gap-y-10 border-t border-gray-200 pt-12 sm:grid-cols-2 lg:mt-20"
        >
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3">
              <Check
                className="mt-1 h-5 w-5 shrink-0 text-blue-600"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h2>
                <p className="mt-2 leading-7 text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </section>
        <section
          aria-labelledby="contact-title"
          className="mt-16 rounded-2xl bg-gray-50 p-8 sm:p-10"
        >
          <h2
            id="contact-title"
            className="text-2xl font-semibold tracking-tight text-gray-900"
          >
            {contactTitle}
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-gray-600">
            {contactDescription}
          </p>
          <a
            className="mt-5 inline-block break-all font-medium text-blue-600 underline underline-offset-4"
            href={`mailto:${email}`}
          >
            {email}
          </a>
        </section>
      </main>
      <Footer />
    </div>
  )
}

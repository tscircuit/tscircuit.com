import { Helmet } from "react-helmet"
import { Header2 } from "@/components/Header2"
import Footer from "@/components/Footer"
import { NotFound } from "@/components/NotFound"

export function NotFoundPage({
  heading = "Page Not Found",
  subtitle = "The page you're looking for doesn't exist.",
}: { heading?: string; subtitle?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Helmet>
        <title>404 - {heading} | tscircuit</title>
        <meta name="description" content={subtitle} />
      </Helmet>
      <Header2 />
      <NotFound heading={heading} />
      <Footer />
    </div>
  )
}

export default NotFoundPage

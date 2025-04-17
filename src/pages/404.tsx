import React from "react"
import { Helmet } from "react-helmet"
import { Header2 } from "@/components/Header2"
import Footer from "@/components/Footer"
import { NotFound } from "@/components/NotFound"

export function NotFoundPage({
  heading = "Page Not Found",
}: { heading?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Helmet>
        <title>404 - {heading} | tscircuit</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist."
        />
      </Helmet>
      <Header2 />
      <NotFound heading={heading} />
      <Footer />
    </div>
  )
}

export default NotFoundPage

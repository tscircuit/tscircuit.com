import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { LatestSnippets } from "@/components/LatestSnippets"

export const NewestPage = () => {
  return (
    <div className="dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold">Newest Snippets</h1>
        <LatestSnippets />
      </div>
      <Footer />
    </div>
  )
}

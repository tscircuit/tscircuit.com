import { Helmet } from "react-helmet-async"
import { Link } from "wouter"
import { AlertTriangle } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export const ContentLoadingErrorPage = ({
  heading,
  subtitle,
  error,
}: {
  heading: string
  subtitle: string
  error?: Error
}) => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <Helmet>
      <title>{heading} | tscircuit</title>
    </Helmet>
    <Header />
    <div className="flex-1 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {heading}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{subtitle}</p>
          {error?.message && (
            <details className="text-left bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        <div className="space-y-3">
          <Link href="/">
            <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
)

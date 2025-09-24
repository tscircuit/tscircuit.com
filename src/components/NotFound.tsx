import { Button } from "@/components/ui/button"
import { Link } from "wouter"

export function NotFound({ heading = "Page not found" }: { heading?: string }) {
  return (
    <section className="flex-1 flex items-center justify-center min-h-[90vh]">
      <div className="container px-4 md:px-6 py-12 flex flex-col items-center text-center max-w-3xl">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="mb-2">
            <span className="text-3xl font-bold text-white bg-blue-500 px-4 py-2 rounded-md shadow-md inline-block">
              404
            </span>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          {heading}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved to another
          address.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
              Return Home
            </Button>
          </Link>
          <Link href="/search">
            <Button size="lg" variant="outline">
              Search Packages
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useLocation } from "wouter"
import { useGlobalStore } from "../hooks/use-global-store"
import { CreateNewSnippetWithAiHero } from "./CreateNewSnippetWithAiHero"
import { TypeBadge } from "./TypeBadge"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { Star } from "lucide-react"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { StarFilledIcon } from "@radix-ui/react-icons"

export const LandingHero = () => {
  const { should_onboarding_tips_be_closed, setOnboardingTipsClosed } =
    useGlobalStore((state) => ({
      should_onboarding_tips_be_closed: state.should_onboarding_tips_be_closed,
      setOnboardingTipsClosed: state.setOnboardingTipsClosed,
    }))
  const [, setLocation] = useLocation()
  const axios = useAxios()

  const { data: trendingSnippets } = useQuery<Snippet[]>(
    "trendingSnippets",
    async () => {
      const response = await axios.get("/snippets/list_trending")
      return response.data.snippets
    },
  )

  return (
    <div className="p-6">
      <div className="mb-12">
        <h1 className="text-xl font-bold mb-4">
          Design Circuit Boards with Code
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          tscircuit is an open-source library
          <a
            href="https://github.com/tscircuit/tscircuit"
            className="inline-flex items-center translate-y-[3px]"
          >
            <img
              src="https://img.shields.io/github/stars/tscircuit/tscircuit?style=social"
              alt="GitHub stars"
              className="mx-1"
            />
          </a>
          for creating and sharing electronic designs using TypeScript and
          React. Design functional circuit boards you can actually order using
          code, completely in your browser!
        </p>

        {trendingSnippets && trendingSnippets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Trending Snippets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingSnippets.slice(0, 6).map((snippet) => (
                <Link
                  key={snippet.snippet_id}
                  href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
                  className="text-sm flex justify-between text-blue-600 py-3 px-3 border border-gray-300 shadow rounded-sm m-0 items-center"
                >
                  <div className="truncate max-w-[80%]">
                    {snippet.owner_name}/{snippet.unscoped_name}
                  </div>
                  <div className="flex items-center ml-2 flex-shrink-0">
                    {snippet.star_count || 0}
                    <StarFilledIcon className="w-3 h-3 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!should_onboarding_tips_be_closed && (
          <Card className="mb-6 bg-gray-50 rounded-sm">
            <CardHeader className="p-3 pl-8">
              <CardTitle className="flex justify-between items-center">
                <div className="pt-2">Onboarding Tips</div>
                <Button
                  variant="ghost"
                  className="text-gray-400 text-2xl"
                  onClick={() =>
                    setOnboardingTipsClosed(!should_onboarding_tips_be_closed)
                  }
                >
                  &times;
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc marker:text-gray-400 pl-5 space-y-2">
                <li>
                  tscircuit snippets are React components that turn into
                  manufacturable circuit boards, circuit modules, 3D models or
                  footprints.
                </li>
                <li>
                  You can design full boards, or individual components like
                  chips
                </li>
                <li>
                  You can export snippets to{" "}
                  <a href="#" className="text-blue-600">
                    KiCad
                  </a>
                  ,{" "}
                  <a href="#" className="text-blue-600">
                    Gerbers
                  </a>
                  ,{" "}
                  <a href="#" className="text-blue-600">
                    STEP
                  </a>
                  , and other formats
                </li>
                <li>Press "import" when coding to import other snippets</li>
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <Link href="/editor?template=blank-circuit-board">
              <Button className="w-full justify-between mb-2 px-2">
                Create new <TypeBadge type="board" className="ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-gray-600">
              A printed circuit board containing multiple chips, resistors and
              capacitors to form a functional, manufacturable electronic device.
            </p>
          </div>
          <div>
            <Link href="/editor?template=blank-circuit-module">
              <Button className="w-full justify-between mb-2 px-2">
                Create new <TypeBadge type="package" className="ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-gray-600">
              A chip or circuit module that you'd like to use as part of a
              larger package.
            </p>
          </div>
          <div>
            <Link href="/editor?template=blank-footprint">
              <Button className="w-full justify-between mb-2 px-2">
                Create new <TypeBadge type="footprint" className="ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-gray-600">
              A footprint or landing-pattern for a component. This is usually
              used as part of a chip.
            </p>
          </div>
          <div>
            <Link href="/editor?template=blank-3d-model">
              <Button className="w-full justify-between mb-2 px-2">
                Create new <TypeBadge type="model" className="ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-gray-600">
              A 3d model of a component. This is usually used as part of a chip.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <CreateNewSnippetWithAiHero />
        </div>
      </div>
    </div>
  )
}

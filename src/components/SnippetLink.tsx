import { Link } from "wouter"

export const SnippetLink = ({
  snippet,
}: {
  snippet: {
    owner_name: string
    name: string
    unscoped_name: string
  }
}) => {
  return (
    <>
      <Link
        className="text-blue-500 font-semibold hover:underline"
        href={`/${snippet.owner_name}`}
      >
        {snippet.owner_name}
      </Link>
      <span className="px-0.5 text-gray-500">/</span>
      <Link
        className="text-blue-500  font-semibold hover:underline"
        href={`/${snippet.name}`}
      >
        {snippet.unscoped_name}
      </Link>
    </>
  )
}

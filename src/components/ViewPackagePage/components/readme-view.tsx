import { Edit, FileText, List } from "lucide-react"

export default function ReadmeView() {
  return (
    <div className="mt-4 border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden">
      <div className="flex items-center px-4 py-2 bg-gray-100 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d]">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          <span className="font-semibold">README</span>
        </div>
        <div className="ml-4 px-2 py-0.5 bg-gray-200 dark:bg-[#30363d] rounded-md text-xs">MIT license</div>
        <div className="ml-auto flex items-center">
          <Edit className="h-4 w-4 mr-1" />
          <List className="h-4 w-4 ml-2" />
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-[#0d1117]">
        <h2 className="text-2xl font-bold mb-4">@tscircuit/core</h2>
        <p className="mb-4">The core logic used to build Circuit JSON from tscircuit React elements.</p>
        <div className="mb-4">
          <a href="#" className="text-blue-600 dark:text-[#58a6ff] hover:underline">
            tscircuit
          </a>
          <span className="mx-2">•</span>
          <a href="#" className="text-blue-600 dark:text-[#58a6ff] hover:underline">
            Development Guide
          </a>
          <span className="mx-2">•</span>
          <a href="#" className="text-blue-600 dark:text-[#58a6ff] hover:underline">
            Core Benchmarks
          </a>
        </div>
        <p>
          You can use <code className="bg-gray-100 dark:bg-[#161b22] px-1 py-0.5 rounded">core</code> to create Circuit
          JSON, which can then be converted into Gerbers, viewed online, and much
        </p>
      </div>
    </div>
  )
}


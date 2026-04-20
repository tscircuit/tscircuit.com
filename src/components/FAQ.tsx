import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

const QUESTIONS = [
  {
    question: "Can I use tscircuit commercially?",
    answer:
      "You can use tscircuit for commercial purposes. tscircuit is under the same permissive MIT license as Node.js, React, and thousands of other popular projects you are likely already using! ",
  },
  {
    question: "Can I import designs from other software?",
    answer:
      "tscircuit has some support for importing designs from other software, but it's not yet fully featured. You should file an issue on our Github if you'd like to see a specific format supported.",
  },
  {
    question: "Can I use tscircuit locally?",
    answer:
      "Yes, you can use tscircuit locally using the tscircuit CLI, but we recommend starting with the web-based application for simplicity.",
  },
  {
    question: "Can tscircuit make schematics? Is it extra effort?",
    answer:
      "tscircuit always renders both a schematic and PCB. Unlike traditional EDA where the schematic capture and PCB layout are separate processes, tscircuit combines them by allowing a user to specify constraints and automations. This means that you can design a schematic and then immediately see a PCB layout or vice versa.",
  },
  {
    question: "What exactly is tscircuit?",
    answer: (
      <>
        <p className="mb-2">
          tscircuit is a <strong>React/TypeScript framework</strong> for
          designing electronic circuits programmatically.
        </p>
        <p className="mb-2">
          Instead of using traditional graphical interfaces, you write code to
          define components, their connections, and layout constraints. This
          "electronics design as code" approach unlocks powerful capabilities
          like reusable packages, continuous automation, parameterization, and
          integration with modern software development workflows (like version
          control with Git).
        </p>
        <p className="mb-2">
          While the core of tscircuit is the framework, the term "tscircuit"
          often refers to the broader <strong>ecosystem</strong> built around
          it. This includes:
        </p>
        <ul className="list-disc list-inside mb-2 pl-4">
          <li>The online development platform and registry (tscircuit.com)</li>
          <li>
            The{" "}
            <a
              className="text-blue-600 underline hover:text-blue-800"
              href="https://docs.tscircuit.com/intro/quickstart-cli"
            >
              command-line interface (CLI)
            </a>{" "}
            for local development
          </li>
        </ul>
        <p>
          tscircuit is a modern, web-first approach to hardware development. To
          learn more about the core concepts and architecture, visit the{" "}
          <a
            href="https://docs.tscircuit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 hover:text-blue-800" // Optional styling
          >
            official documentation
          </a>
          .
        </p>
      </>
    ),
  },
  {
    question: "Can I use tscircuit programmatically?",
    answer: (
      <>
        <p className="mb-2">
          Yes, you can use tscircuit programmatically with these packages:
        </p>
        <ul className="list-disc list-inside mb-2 pl-4">
          <li>
            <a
              className="text-blue-600 underline hover:text-blue-800"
              href="https://github.com/tscircuit/core"
            >
              @tscircuit/core
            </a>{" "}
            - Execute tscircuit React code directly in Node, Bun or a browser to
            create Circuit JSON
          </li>
          <li>
            <a
              className="text-blue-600 underline hover:text-blue-800"
              href="https://github.com/tscircuit/eval"
            >
              @tscircuit/eval
            </a>{" "}
            - Dynamically run tscircuit code with automatic import handling and
            transpilation support builtin
          </li>
          <li>
            <a
              className="text-blue-600 underline hover:text-blue-800"
              href="https://github.com/tscircuit/runframe"
            >
              @tscircuit/runframe
            </a>{" "}
            - React components for viewing and running circuits in the browser
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "How do I display tscircuit circuits on my website?",
    answer: (
      <span>
        tscircuit code builds into{" "}
        <a
          className="text-blue-600 underline hover:text-blue-800"
          href="https://github.com/tscircuit/circuit-json"
        >
          Circuit JSON
        </a>
        , you can then use the <code>CircuitJsonViewer</code> component
        inside&nbsp;
        <a
          className="text-blue-600 underline hover:text-blue-800"
          href="https://github.com/tscircuit/runframe"
        >
          @tscircuit/runframe
        </a>{" "}
        to display the Circuit JSON on your website as a Schematic, PCB, or 3D
        view.
      </span>
    ),
  },
  {
    question: "What is Circuit JSON?",
    answer: (
      <span>
        <a
          className="text-blue-600 underline hover:text-blue-800"
          href="https://github.com/tscircuit/circuit-json"
        >
          Circuit JSON
        </a>{" "}
        is a JSON format for representing electronic circuits. It is a sort of
        assembly language electronic circuits. All tscircuit designs are
        compiled to Circuit JSON as the intermediary format.
      </span>
    ),
  },
]

export const FAQ = () => (
  <section className="w-full py-12 md:py-20 lg:py-24" id="faq">
    <div className="container mx-auto max-w-7xl px-4 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] lg:gap-10">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-4">
            <h2 className="max-w-[12ch] text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Frequently Asked{" "}
              <span className="text-blue-600">Questions.</span>
            </h2>
            <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Have questions? We&apos;ve answered the most common ones below.
            </p>
          </div>

          <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              Still have questions?
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-7 text-slate-600">
              Our support team is here to help before and after your purchase.
            </p>
            <a
              href="mailto:hello@tscircuit.com"
              className="mt-6 inline-flex"
            >
              <Button className="h-11 rounded-2xl px-5 text-sm font-medium shadow-sm">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <Accordion type="single" collapsible defaultValue="item-1">
            {QUESTIONS.map((q, i) => (
              <AccordionItem
                key={i}
                value={`item-${i + 1}`}
                className="border-b border-slate-200 last:border-b-0"
              >
                <AccordionTrigger className="px-4 py-5 text-left text-base font-medium text-slate-900 hover:no-underline data-[state=open]:text-blue-600 md:px-5 [&>svg]:h-7 [&>svg]:w-7 [&>svg]:rounded-full [&>svg]:border [&>svg]:border-slate-200 [&>svg]:bg-white [&>svg]:p-1.5 [&>svg]:text-slate-500 data-[state=open]:[&>svg]:border-blue-200 data-[state=open]:[&>svg]:bg-blue-50 data-[state=open]:[&>svg]:text-blue-600">
                  {q.question}
                </AccordionTrigger>
                <AccordionContent className="bg-slate-50 px-4 pb-5 pt-0 text-sm leading-7 text-slate-600 md:px-5 [&_a]:!text-blue-600 [&_a:hover]:!text-blue-700 [&_code]:rounded [&_code]:bg-slate-200 [&_code]:px-1 [&_p]:text-slate-600 [&_strong]:text-slate-900 [&_ul]:space-y-2 [&_li]:text-slate-600">
                  <div className="border-t border-slate-200 pt-4">
                    {typeof q.answer === "string" ? <p>{q.answer}</p> : q.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  </section>
)

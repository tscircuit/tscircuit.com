import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  <section className="w-full py-12 md:py-24 lg:py-32" id="faq">
    <div className="container px-4 md:px-6 mx-auto">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">
            Got questions? We've got answers.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-4 py-12">
        <Accordion type="single" collapsible>
          {QUESTIONS.map((q, i) => (
            <AccordionItem key={i} value={`item-${i + 1}`}>
              <AccordionTrigger>{q.question}</AccordionTrigger>
              <AccordionContent>{q.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
)

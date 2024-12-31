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
    answer:
      "tscircuit is first and foremost a framework, but it also can be used to refer to the tscircuit platform, the tscircuit company, the tscircuit registry or ecosystem of components and packages for working with tscircuit. When you use tscircuit, you're becoming compatible with a growing ecosystem of web-first electronics technologies.",
  },
  {
    question: "Can I use tscircuit programmatically?",
    answer: (
      <span>
        Yes, use the{" "}
        <a href="https://github.com/tscircuit/core">@tscircuit/core</a> module
        to use classes and/or React and build to various formats. If you'd like
        to dynamically evaluate tscircuit code with automatic import handling,
        you can use{" "}
        <a href="https://github.com/tscircuit/eval-webworker">
          @tscircuit/eval-webworker
        </a>
        . You can use{" "}
        <a href="https://github.com/tscircuit/runframe">@tscircuit/runframe</a>{" "}
        to any view (schematic, PCB etc.) of your compiled Circuit JSON.
      </span>
    ),
  },
  {
    question: "How do I display tscircuit circuits on my website?",
    answer: (
      <span>
        You can use our React components to display tscircuit on a webpage. For
        simple cases, you can use{" "}
        <a href="https://github.com/tscircuit/pcb-viewer">
          @tscircuit/pcb-viewer
        </a>
        ,{" "}
        <a href="https://github.com/tscircuit/schematic-viewer">
          @tscircuit/schematic-viewer
        </a>
        , or{" "}
        <a href="https://github.com/tscircuit/3d-viewer">
          @tscircuit/3d-viewer
        </a>{" "}
        directly. For more complex use cases,{" "}
        <a href="https://github.com/tscircuit/runframe">@tscircuit/runframe</a>{" "}
        is recommended as it provides a unified interface for all viewers.
      </span>
    ),
  },
  {
    question: "What is Circuit JSON?",
    answer: (
      <span>
        <a href="https://github.com/tscircuit/circuit-json">Circuit JSON</a> is
        a JSON format for representing electronic circuits. It is a sort of
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

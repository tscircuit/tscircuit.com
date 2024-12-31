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

import {
  type ChangeEventHandler,
  type FormEvent,
  useMemo,
  useState,
} from "react"
import { useAxios } from "@/hooks/use-axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const isCircuitJson = (value: unknown) => {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        typeof (item as { type: unknown }).type === "string",
    )
  )
}

export default function ReportBugPage() {
  const axios = useAxios()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fileName, setFileName] = useState("")
  const [circuitJson, setCircuitJson] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null)

  const isSubmitDisabled = useMemo(
    () => !title.trim() || !circuitJson || isSubmitting,
    [title, circuitJson, isSubmitting],
  )

  const onFileSelected: ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const file = event.target.files?.[0]
    setError(null)
    setSubmittedUrl(null)

    if (!file) {
      setFileName("")
      setCircuitJson(null)
      return
    }

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)

      if (!isCircuitJson(parsed)) {
        setError(
          "This file doesn't look like Circuit JSON. Export your project to Circuit JSON and upload that file.",
        )
        setCircuitJson(null)
        setFileName("")
        return
      }

      setCircuitJson(parsed)
      setFileName(file.name)
    } catch {
      setError(
        "Couldn't parse that file as JSON. Please export and upload a valid Circuit JSON file.",
      )
      setCircuitJson(null)
      setFileName("")
    }
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!title.trim() || !circuitJson) {
      setError("Please add a title and upload Circuit JSON before submitting.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSubmittedUrl(null)

    try {
      const response = await axios.post("/autorouting/bug_reports/create", {
        title: title.trim(),
        description: description.trim() || undefined,
        circuit_json: circuitJson,
      })

      const reportId =
        response?.data?.autorouting_bug_report?.autorouting_bug_report_id

      if (reportId) {
        setSubmittedUrl(
          `https://api.tscircuit.com/autorouting/bug_reports/view?autorouting_bug_report_id=${reportId}`,
        )
      }

      setTitle("")
      setDescription("")
      setFileName("")
      setCircuitJson(null)
    } catch (submissionError: any) {
      setError(
        submissionError?.data?.message ??
          submissionError?.message ??
          "Failed to submit autorouting bug report.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold">Report Bug</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Submit a bug report to help us improve tscircuit.
      </p>

      <Tabs defaultValue="autorouting" className="mt-6">
        <TabsList>
          <TabsTrigger value="autorouting">Autorouting Bug Report</TabsTrigger>
          <TabsTrigger value="project">Project Bug Report</TabsTrigger>
        </TabsList>

        <TabsContent value="autorouting" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Autorouting Bug Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: traces overlap on power net"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What did you expect vs what happened?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="circuit-json">Circuit JSON</Label>
                  <Input
                    id="circuit-json"
                    type="file"
                    accept=".json,application/json"
                    onChange={onFileSelected}
                  />
                  <p className="text-sm text-muted-foreground">
                    Export your project to Circuit JSON, then upload that file
                    here. Please do not upload Simple Route JSON.
                  </p>
                  {fileName && (
                    <p className="text-sm text-green-700">
                      Ready to submit: <strong>{fileName}</strong>
                    </p>
                  )}
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                {submittedUrl && (
                  <p className="text-sm text-green-700">
                    Bug report submitted. View it here:{" "}
                    <a
                      href={submittedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {submittedUrl}
                    </a>
                  </p>
                )}

                <Button type="submit" disabled={isSubmitDisabled}>
                  {isSubmitting ? "Submitting..." : "Submit autorouting bug"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Bug Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For project bug reports, please run <code>tsci dev</code> and go
                to <code> File &gt; Report Bug</code>.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

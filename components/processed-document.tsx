import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"

interface ProcessedDocumentProps {
  result: {
    combinedMarkdown?: string;
    pages?: Array<{
      index: number
      markdown: string
      images?: Array<any>
    }>
  }
}

export function ProcessedDocument({ result }: ProcessedDocumentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processed Document</CardTitle>
      </CardHeader>
      <CardContent>
        {result.combinedMarkdown ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{result.combinedMarkdown}</ReactMarkdown>
          </div>
        ) : result.pages ? (
          <div className="space-y-6">
            {result.pages.map((page) => (
              <div key={page.index} className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Page {page.index}</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{page.markdown}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No content extracted from document</p>
        )}
      </CardContent>
    </Card>
  )
} 
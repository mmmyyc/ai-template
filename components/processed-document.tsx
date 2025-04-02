import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProcessedDocumentProps {
  result: {
    pages?: Array<{
      index: number
      markdown: string
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
        {result.pages ? (
          <div className="space-y-6">
            {result.pages.map((page) => (
              <div key={page.index} className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Page {page.index}</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {page.markdown}
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
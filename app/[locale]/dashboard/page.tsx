
import { FileUpload } from "./components/uploadpdf/file-upload"
import { PageHeader } from "./components/uploadpdf/page-header"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader
        title="Document OCR Processor"
        description="Upload your PDF documents to extract text and structured content while maintaining document hierarchy."
      />
      <div className="mt-8">
        <FileUpload />
      </div>
    </main>
  )
}


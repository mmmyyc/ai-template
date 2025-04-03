import { type NextRequest, NextResponse } from "next/server"
import { Mistral } from "@mistralai/mistralai"

// Initialize the Mistral client with the API key
const apiKey = process.env.MISTRAL_API_KEY;
const mistralClient = new Mistral({apiKey: apiKey});

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 })
    }

    // Process the document using Mistral AI's OCR processor
    const ocrResponse = await mistralClient.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: fileUrl,
      },
      includeImageBase64: true,
    })

    // Process and combine all pages into a single markdown document
    let combinedMarkdown = "";
    const pages = ocrResponse.pages || [];
    
    // Process each page
    pages.forEach((page) => {
      // Add page header
      // combinedMarkdown += `## Page ${page.index}\n\n`;
      
      // Add page content with images (as they come from the API)
      combinedMarkdown += page.markdown || "";
      // combinedMarkdown += "\n\n";
    });

    // Transform the response to a more usable format for the frontend
    const result = {
      combinedMarkdown,
      pages: pages.map(page => ({
        index: page.index,
        markdown: page.markdown,
        // Simply pass any images through without trying to access specific properties
        images: page.images || []
      })),
      metadata: {
        pageCount: pages.length,
        documentType: "PDF",
        imageCount: pages.reduce((count, page) => count + (page.images?.length || 0), 0)
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process document" },
      { status: 500 },
    )
  }
}


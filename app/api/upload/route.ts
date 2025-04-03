import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate a unique filename
    const uniqueFilename = `${Date.now()}-${file.name}`

    // Upload the file to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: "public",
    })

    return NextResponse.json({data: { fileUrl: blob.url }})
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}


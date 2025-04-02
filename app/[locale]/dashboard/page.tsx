"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ArticleEditor from "@/app/[locale]/dashboard/components/ai/article-editor"
import { Save, Sparkles } from "lucide-react"

export default function Home() {
  const [title, setTitle] = useState("Roman Empire History")

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <div className="font-bold text-xl">Logoipsum</div>
            <Button size="sm" className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI</span>
            </Button>
          </div>

          <div className="text-lg font-medium">{title}</div>

          <div className="flex items-center gap-2">
            <Button variant="default" className="gap-1">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left panel - Editor with integrated AI component preview */}
          <div className="h-[calc(100vh-120px)]">
            <ArticleEditor />
          </div>

          {/* Right panel - Reference view */}
          <div className="border rounded-lg shadow-sm bg-white dark:bg-gray-950 h-[calc(100vh-120px)] overflow-auto p-6">
            <h2 className="text-lg font-medium mb-4">Here are five detailed historical facts:</h2>

            <div className="prose prose-sm dark:prose-invert">
              <p className="font-mono text-sm text-gray-500">### 1. **The Rise and Fall of the Roman Empire**</p>

              <p>
                The Roman Empire, one of the most significant and influential empires in human history, began in 27 BCE
                when Augustus Caesar became the first Roman Emperor. Rome initially grew as a city-state, then expanded
                through military conquest, diplomacy, and alliances into an empire that spanned Europe, North Africa,
                and parts of Asia.
              </p>

              <p className="font-mono text-sm text-gray-500">
                - **Rise**: The early Roman Republic expanded its influence through wars, including the Punic Wars with
                Carthage, which led to Rome controlling vast parts of the Mediterranean. Julius Caesar's dictatorship
                and subsequent assassination led to civil wars, ending with his grand-nephew Augustus rising as the
                first emperor, marking the beginning of the Roman Empire. The Pax Romana ("Roman Peace") that followed
                allowed Rome to enjoy unprecedented prosperity and territorial expansion.
              </p>

              <p className="font-mono text-sm text-gray-500">
                - **Achievements**: The Romans were known for their impressive engineering, legal system, and road
                networks. Structures like aqueducts, the Colosseum, and the Roman Forum were engineering marvels. Roman
                law, with its emphasis on legal rights and written statutes, influenced many modern legal systems.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


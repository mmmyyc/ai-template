import { Check } from "lucide-react"

export function FeatureList() {
  const features = [
    "Maintains document structure",
    "Preserves formatting",
    "Handles complex layouts",
    "Returns markdown format",
  ]

  return (
    <div className="flex flex-col gap-1">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">{feature}</span>
        </div>
      ))}
    </div>
  )
}


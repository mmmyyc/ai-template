"use client"

import { useEffect, useRef } from "react"

interface SlideInjectorProps {
  slides: string[]
}

export function SlideInjector({ slides }: SlideInjectorProps) :any {
  const injectedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Function to inject the scaler script into each slide iframe
    const injectScalerScript = () => {
      slides.forEach((slideHtml, index) => {
        // Skip if already injected or if HTML is empty
        if (injectedRef.current.has(`slide-${index}`) || !slideHtml) return

        try {
          // Find all iframes
          const iframes = document.querySelectorAll("iframe")

          iframes.forEach((iframe) => {
            // Check if this is an iframe we want to inject into
            // We can't use src since we're using HTML content now
            // Instead, we need to match based on some identifier
            if (iframe.id === `slide-frame-${index}` || iframe.className.includes(`slide-${index}`)) {
              // Wait for iframe to load
              iframe.onload = () => {
                try {
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

                  if (iframeDoc) {
                    // Create script element
                    const script = iframeDoc.createElement("script")
                    script.src = "./scripts/slide-scaler.js"
                    script.async = true

                    // Append to iframe document
                    iframeDoc.head.appendChild(script)

                    // Mark as injected
                    injectedRef.current.add(`slide-${index}`)
                  }
                } catch (err) {
                  console.error("Error injecting script into iframe:", err)
                }
              }
            }
          })
        } catch (err) {
          console.error("Error finding iframe:", err)
        }
      })
    }

    // Run injection
    injectScalerScript()

    // Set up a mutation observer to detect when new iframes are added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          injectScalerScript()
        }
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [slides])

  // This component doesn't render anything
  return null
}


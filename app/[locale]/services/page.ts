export async function getLandingPage(locale: string) {
  try {
    if (locale === "zh") {
      locale = "zh";
    }
    return await import(
      `@/messages/${locale.toLowerCase()}.json`
    ).then((module) => module.default);
  } catch (error) {
    console.warn(`Failed to load ${locale}.json, falling back to en.json`);
    return await import("@/messages/en.json").then(
      (module) => module.default 
    );
  }
}


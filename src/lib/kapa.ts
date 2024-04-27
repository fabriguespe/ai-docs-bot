import fetch from "node-fetch";

export async function kapaApiCall(query: string) {
  try {
    if (query == "Heartbeat") return "I'm alive";
    if (process.env.DEBUG) console.log("Fetching from Kapa.ai API...");
    const response = await fetch(
      `${process.env.KAPA_API_ENDPOINT}?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "X-API-TOKEN": process.env.KAPA_API_TOKEN as string,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    //@ts-ignore
    const message = formatForPlainText(data?.answer);
    console.log("Data from Kapa.ai API:", query, message);
    return message;
  } catch (error) {
    console.error("Failed to fetch from Kapa.ai API:", error);
    throw error;
  }
}
export function formatForPlainText(response: string): string {
  // Remove Markdown links and directly capture URLs to list them later
  let plainText = response.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

  plainText = plainText.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, text, url) => url
  );

  // Extract and remove footnotes, capturing URLs to list them
  const footnoteRegex = /\[\^(\d+)\]:\s*\[Source\]\(([^)]+)\)/g;
  let match;
  let sources = [];
  while ((match = footnoteRegex.exec(response)) !== null) {
    sources.push(match[2]); // Capture just the URL
  }
  plainText = plainText.replace(footnoteRegex, "");

  // Remove remaining Markdown formatting (e.g., bold **text**)
  plainText = plainText.replace(/\*\*([^*]+)\*\*/g, "$1");

  return plainText;
}

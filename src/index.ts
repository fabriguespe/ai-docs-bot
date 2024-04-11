import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import HandlerContext from "./handler-context";
import run from "./runner.js";
import fetch from "node-fetch";

async function mockApiCall(query: string) {
  console.log(
    `${process.env.KAPA_API_ENDPOINT}?query=${encodeURIComponent(query)}`
  );
  try {
    console.log("Fetching from Kapa.ai API...");
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
    const message = formatForPlainText(data?.answer); // + generateMessageFooter(data?.relevant_sources);
    console.log("Data from Kapa.ai API:", message);
    return message;
  } catch (error) {
    console.error("Failed to fetch from Kapa.ai API:", error);
    throw error;
  }
}
function formatForPlainText(response: string): string {
  // Remove Markdown links and directly capture URLs to list them later
  let plainText = response.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

  plainText = response.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, text, url) => {
      return `${text} (${url})`; // Change this line to just return `text` if you don't want URLs inline
    }
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

function generateMessageFooter(
  sources: Array<{ source_url: string; title: string }>
): string {
  let footer = "\n\n---\n**Further Reading:**\n";
  sources.forEach((source, index) => {
    footer += `${index + 1}. [${source.title}](${source.source_url})\n`;
  });
  return footer;
}
run(async (context: HandlerContext) => {
  const { message } = context;
  const wallet = privateKeyToAccount(process.env.KEY as `0x${string}`);

  const { content, senderAddress } = message;

  if (senderAddress?.toLowerCase() === wallet.address?.toLowerCase()) {
    // safely ignore this message
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await context.reply("Thinking...");
  const apiResponse = await mockApiCall(content);
  await context.reply(apiResponse);
});

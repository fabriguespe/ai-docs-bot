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

  await new Promise((resolve) => setTimeout(resolve, 1000)); // Send initial thinking message
  await context.reply("Thinking...");

  let countdown = 15; // Start countdown from 15 seconds
  const intervalTime = 6000; // Interval time in milliseconds

  // Define a function to generate friendly messages with countdown
  const generateFriendlyMessage = (remainingTime: number) => {
    const messages = [
      `Just a moment, I'm on it... (about ${remainingTime} seconds left)`,
      `Hang tight! Crunching the numbers... (around ${remainingTime} seconds remaining)`,
      `One sec, working some magic here... (might take another ${remainingTime} seconds)`,
      `Give me a moment, weaving through the data... (up to ${remainingTime} seconds)`,
      `Still here, just taking a moment to get everything right... (approximately ${remainingTime} seconds left)`,
      `Hold on, making sure everything is perfect... (about ${remainingTime} seconds to go)`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Set up a periodic message every 6 seconds test
  const thinkingInterval = setInterval(async () => {
    countdown -= intervalTime / 1000; // Decrease countdown by interval time in seconds
    if (countdown <= 0) {
      clearInterval(thinkingInterval); // Stop the interval if countdown reaches 0 or below
    } else {
      const randomMessage = generateFriendlyMessage(countdown);
      await context.reply(randomMessage);
    }
  }, intervalTime); // 6000 milliseconds = 6 seconds

  try {
    const apiResponse = await mockApiCall(content);
    clearInterval(thinkingInterval); // Stop the periodic messages
    await context.reply(apiResponse);
  } catch (error) {
    clearInterval(thinkingInterval); // Ensure to clear the interval on error as well
    // Handle the error, for example, by sending an error message to the user
    await context.reply(
      "Failed to process your request. Please try again later."
    );
  }
});

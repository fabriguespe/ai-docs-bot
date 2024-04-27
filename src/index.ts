import "dotenv/config";

import { run, HandlerContext } from "@xmtp/botkit";
import { kapaApiCall } from "./lib/kapa.js";

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender
  const { content, senderAddress } = context.message;

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
    const apiResponse = await kapaApiCall(content);
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

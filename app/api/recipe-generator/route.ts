import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-3.5-turbo"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

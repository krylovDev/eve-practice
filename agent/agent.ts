import { defineAgent } from "eve";
import { createOpenAI } from "@ai-sdk/openai"

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? " "
})

export default defineAgent({
  model: openrouter.chat('google/gemini-2.5-flash-lite'),
  modelContextWindowTokens: 1_000_000
});

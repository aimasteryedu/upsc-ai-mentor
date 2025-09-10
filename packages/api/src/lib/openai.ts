import OpenAI from "openai";

// Singleton OpenAI client for server-side use (Edge Functions)
let _openaiClient: OpenAI | null = null;

/**
 * Gets or creates an OpenAI client
 * This should only be used in server-side code (Edge Functions)
 */
export function getOpenAIClient() {
  if (!_openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY must be defined in environment variables");
    }

    _openaiClient = new OpenAI({
      apiKey,
    });
  }

  return _openaiClient;
}

/**
 * Generates embeddings for the provided text using OpenAI's text-embedding-3-large model
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  const openai = getOpenAIClient();

  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
    encoding_format: "float",
  });

  return response.data[0].embedding;
}

/**
 * Splits a long text into chunks of approximately the given token limit
 */
export function splitTextIntoChunks(text: string, maxTokens = 500): string[] {
  // A very rough approximation: 1 token ~= 4 characters for English text
  const charPerToken = 4;
  const maxChars = maxTokens * charPerToken;
  
  // Split text into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed the max chars, start a new chunk
    if (currentChunk.length + sentence.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    
    currentChunk += sentence + " ";
  }
  
  // Add the last chunk if not empty
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

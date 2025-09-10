import axios from "axios";
import { searchDocuments } from "../services/rag";

interface OrchestrationRequest {
  type: "lesson" | "test" | "script" | "notes";
  query: string;
  syllabusNodeId?: string;
  systemPrompt?: string;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}

/**
 * Edge function for orchestrating LLM operations
 * This uses Kimi K2 via OpenRouter for various content generation tasks
 */
export async function orchestratorRouter(req: Request) {
  try {
    const { type, query, syllabusNodeId, systemPrompt, parameters } = await req.json() as OrchestrationRequest;
    
    if (!type || !query) {
      return new Response(
        JSON.stringify({
          error: "type and query are required"
        }),
        { status: 400 }
      );
    }
    
    // Get relevant documents using RAG
    const retrievedDocs = await searchDocuments(query, 0.5, 5);
    
    // Build context from retrieved documents
    const context = retrievedDocs
      .map((doc) => doc.text)
      .join("\n\n");
    
    // Create a customized system prompt based on the request type
    let finalSystemPrompt = systemPrompt || "";
    
    switch (type) {
      case "lesson":
        finalSystemPrompt = `
You are an expert UPSC coach creating educational content.
Create a comprehensive lesson on the topic below.
Include clear explanations, examples, and key points to remember.
Format the output with proper headings, subheadings, and bullet points.

Context from relevant documents:
${context}

${finalSystemPrompt}
        `.trim();
        break;
        
      case "test":
        finalSystemPrompt = `
You are an expert UPSC exam setter.
Create challenging questions based on the topic below.
For prelims, create MCQs with 4 options each and mark the correct answer.
For mains, create descriptive questions with expected answer points.

Context from relevant documents:
${context}

${finalSystemPrompt}
        `.trim();
        break;
        
      case "script":
        finalSystemPrompt = `
You are an expert UPSC coach creating a podcast or video script.
Write a conversational script that explains the topic clearly.
Include questions a student might ask and provide detailed answers.
Format as a dialogue with clear speaker designations.

Context from relevant documents:
${context}

${finalSystemPrompt}
        `.trim();
        break;
        
      case "notes":
        finalSystemPrompt = `
You are an expert UPSC note maker.
Create comprehensive notes on the topic below.
Include key facts, concepts, theories, and important points.
Format with clear headings, bullet points, and highlight important terms.
Include proper citations for any specific claims or facts.

Context from relevant documents:
${context}

${finalSystemPrompt}
        `.trim();
        break;
    }
    
    // Make a request to OpenRouter's API for Kimi K2
    const kimiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "moonshotai/kimi-k2-0905",
        messages: [
          {
            role: "system",
            content: finalSystemPrompt
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: parameters?.temperature ?? 0.7,
        max_tokens: parameters?.maxTokens ?? 2048,
        top_p: parameters?.topP ?? 1,
        frequency_penalty: parameters?.frequencyPenalty ?? 0,
        presence_penalty: parameters?.presencePenalty ?? 0
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_MOONSHOTAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    return new Response(
      JSON.stringify({
        result: kimiResponse.data.choices[0].message.content,
        usage: kimiResponse.data.usage,
        context: {
          docsCount: retrievedDocs.length
        }
      })
    );
  } catch (error: any) {
    console.error("Error in orchestrator router:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { status: 500 }
    );
  }
}

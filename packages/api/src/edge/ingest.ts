import { getSupabaseAdmin } from "../lib/supabase";
import { splitTextIntoChunks } from "../lib/openai";
import { storeDocumentEmbeddings } from "../services/rag";

/**
 * Edge function for content ingestion
 * This handles the ingestion of documents (text, PDFs, etc.) and stores their embeddings
 */
export async function ingestRouter(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const { contentId, text, metadata } = await req.json();
      
      if (!contentId || !text) {
        return new Response(
          JSON.stringify({
            error: "contentId and text are required"
          }),
          { status: 400 }
        );
      }
      
      // Split text into chunks
      const chunks = splitTextIntoChunks(text);
      
      // Store chunks and their embeddings
      await storeDocumentEmbeddings(contentId, chunks, metadata);
      
      return new Response(
        JSON.stringify({
          success: true,
          chunksCount: chunks.length
        })
      );
    } else if (contentType.includes("multipart/form-data")) {
      // TODO: Handle file uploads (PDF, DOCX, etc.)
      return new Response(
        JSON.stringify({
          error: "File upload not implemented yet"
        }),
        { status: 501 }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Unsupported content type"
        }),
        { status: 415 }
      );
    }
  } catch (error: any) {
    console.error("Error in ingest router:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { status: 500 }
    );
  }
}

import { searchDocuments } from "../services/rag";
import { getSyllabusNode, getSyllabusPath } from "../services/syllabus";

/**
 * Edge function for RAG (Retrieval Augmented Generation)
 * This handles semantic search across the content using pgvector
 */
export async function searchRouter(req: Request) {
  try {
    const { query, matchThreshold, matchCount, syllabusNodeId } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({
          error: "query is required"
        }),
        { status: 400 }
      );
    }
    
    // Search for documents matching the query
    const results = await searchDocuments(
      query,
      matchThreshold || 0.5,
      matchCount || 10
    );
    
    // If a syllabus node ID is provided, include its info
    let syllabusContext = null;
    if (syllabusNodeId) {
      const node = await getSyllabusNode(syllabusNodeId);
      const path = await getSyllabusPath(syllabusNodeId);
      
      syllabusContext = {
        node,
        path
      };
    }
    
    return new Response(
      JSON.stringify({
        results,
        syllabusContext
      })
    );
  } catch (error: any) {
    console.error("Error in search router:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { status: 500 }
    );
  }
}

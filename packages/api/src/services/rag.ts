import { getSupabaseAdmin } from "../lib/supabase";
import { generateEmbeddings } from "../lib/openai";

/**
 * Search for documents similar to the query text
 */
export async function searchDocuments(
  queryText: string,
  matchThreshold = 0.5,
  matchCount = 10
) {
  const supabase = getSupabaseAdmin();

  // Generate embedding for the query text
  const embedding = await generateEmbeddings(queryText);

  // Search for similar documents using the pgvector extension
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    throw new Error(`Error searching documents: ${error.message}`);
  }

  return data;
}

/**
 * Store document chunks and their embeddings in the database
 */
export async function storeDocumentEmbeddings(
  contentId: string,
  chunks: string[],
  metadata: any = {}
) {
  const supabase = getSupabaseAdmin();
  
  // Process each chunk in parallel
  const embeddings = await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await generateEmbeddings(chunk);
      return {
        content_id: contentId,
        text: chunk,
        embedding,
        metadata,
      };
    })
  );
  
  // Store all embeddings in the database
  const { data, error } = await supabase
    .from("embeddings")
    .insert(embeddings);
  
  if (error) {
    throw new Error(`Error storing embeddings: ${error.message}`);
  }
  
  return data;
}

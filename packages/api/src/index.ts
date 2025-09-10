// Re-export public API

// Supabase client
export { createSupabaseClient } from "./lib/supabase";

// OpenAI utilities
export { generateEmbeddings, splitTextIntoChunks } from "./lib/openai";

// Services
export * from "./services/rag";
export * from "./services/syllabus";

// Edge functions
export { ingestRouter } from "./edge/ingest";
export { searchRouter } from "./edge/search";
export { orchestratorRouter } from "./edge/orchestrator";

// Types
export type { Database } from "./types/database.types";

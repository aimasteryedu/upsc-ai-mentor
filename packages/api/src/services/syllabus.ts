import { getSupabaseAdmin } from "../lib/supabase";

/**
 * Get all syllabus subjects
 */
export async function getSyllabusSubjects() {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("syllabus_nodes")
    .select("*")
    .eq("level", "subject")
    .order("order");
  
  if (error) {
    throw new Error(`Error fetching syllabus subjects: ${error.message}`);
  }
  
  return data;
}

/**
 * Get all syllabus papers for a subject
 */
export async function getSyllabusPapers(subjectId: string) {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("syllabus_nodes")
    .select("*")
    .eq("level", "paper")
    .eq("parent_id", subjectId)
    .order("order");
  
  if (error) {
    throw new Error(`Error fetching syllabus papers: ${error.message}`);
  }
  
  return data;
}

/**
 * Get all syllabus topics for a paper
 */
export async function getSyllabusTopics(paperId: string) {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("syllabus_nodes")
    .select("*")
    .eq("level", "topic")
    .eq("parent_id", paperId)
    .order("order");
  
  if (error) {
    throw new Error(`Error fetching syllabus topics: ${error.message}`);
  }
  
  return data;
}

/**
 * Get all syllabus subtopics for a topic
 */
export async function getSyllabusSubtopics(topicId: string) {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("syllabus_nodes")
    .select("*")
    .eq("level", "subtopic")
    .eq("parent_id", topicId)
    .order("order");
  
  if (error) {
    throw new Error(`Error fetching syllabus subtopics: ${error.message}`);
  }
  
  return data;
}

/**
 * Get a syllabus node by ID
 */
export async function getSyllabusNode(nodeId: string) {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from("syllabus_nodes")
    .select("*")
    .eq("id", nodeId)
    .single();
  
  if (error) {
    throw new Error(`Error fetching syllabus node: ${error.message}`);
  }
  
  return data;
}

/**
 * Get the full syllabus path for a node (from root to the specified node)
 */
export async function getSyllabusPath(nodeId: string) {
  const supabase = getSupabaseAdmin();
  
  const path: any[] = [];
  let currentNodeId = nodeId;
  
  while (currentNodeId) {
    const { data, error } = await supabase
      .from("syllabus_nodes")
      .select("*")
      .eq("id", currentNodeId)
      .single();
    
    if (error) {
      throw new Error(`Error fetching syllabus path: ${error.message}`);
    }
    
    path.unshift(data);
    currentNodeId = data.parent_id;
  }
  
  return path;
}

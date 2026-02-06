"use server"

import { Tables } from "@/database.types"
import { GeneralResponse } from "@/utils/general-response"
import { createSupabaseServerClient } from "@/utils/supabase-server"

type QuestionType = Tables<"community_questions">["type"]

export async function createCommunityQuestion(
  communityId: number,
  { content, type, index }: { content: string; type: QuestionType; index: number }
): Promise<GeneralResponse<Tables<"community_questions">>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("community_questions")
      .insert({ community_id: communityId, content, type, index })
      .select()
      .single()

    if (error) {
      console.error("Error creating community question:", error)
      return { error: "Error creating question", message: error.message, statusCode: 500 }
    }
    return { data, error: undefined, message: "Question added successfully", statusCode: 200 }
  } catch (err) {
    console.error("Error creating community question:", err)
    return { error: "Error creating question", message: "Error creating question", statusCode: 500 }
  }
}

export async function updateCommunityQuestion(
  id: number,
  { content, type }: { content: string; type: QuestionType }
): Promise<GeneralResponse<Tables<"community_questions">>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("community_questions")
      .update({ content, type })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating community question:", error)
      return { error: "Error updating question", message: error.message, statusCode: 500 }
    }
    return { data, error: undefined, message: "Question updated successfully", statusCode: 200 }
  } catch (err) {
    console.error("Error updating community question:", err)
    return { error: "Error updating question", message: "Error updating question", statusCode: 500 }
  }
}

export async function deleteCommunityQuestion(id: number): Promise<GeneralResponse<boolean>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: question } = await supabase.from("community_questions").select("community_id, index").eq("id", id).single()
    if (!question) {
      return { error: "Question not found", message: "Question not found", statusCode: 404 }
    }

    const { error: deleteError } = await supabase.from("community_questions").delete().eq("id", id)
    if (deleteError) {
      console.error("Error deleting community question:", deleteError)
      return { error: "Error deleting question", message: deleteError.message, statusCode: 500 }
    }

    const { data: rest } = await supabase
      .from("community_questions")
      .select("id, index")
      .eq("community_id", question.community_id)
      .gt("index", question.index)
      .order("index", { ascending: true })

    for (let i = 0; rest && i < rest.length; i++) {
      await supabase.from("community_questions").update({ index: question.index + i }).eq("id", rest[i].id)
    }

    return { data: true, error: undefined, message: "Question deleted successfully", statusCode: 200 }
  } catch (err) {
    console.error("Error deleting community question:", err)
    return { error: "Error deleting question", message: "Error deleting question", statusCode: 500 }
  }
}

export async function moveCommunityQuestion(
  id: number,
  direction: "up" | "down"
): Promise<GeneralResponse<Tables<"community_questions">[]>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: question } = await supabase.from("community_questions").select("community_id, index").eq("id", id).single()
    if (!question) {
      return { error: "Question not found", message: "Question not found", statusCode: 404 }
    }

    const { data: all } = await supabase
      .from("community_questions")
      .select("id, index")
      .eq("community_id", question.community_id)
      .order("index", { ascending: true })

    if (!all || all.length < 2) {
      return { data: all ?? [], error: undefined, message: "Order updated", statusCode: 200 }
    }

    const idx = all.findIndex((q) => q.id === id)
    if (idx === -1) return { error: "Question not found", message: "Question not found", statusCode: 404 }

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= all.length) {
      return { data: all, error: undefined, message: "Order updated", statusCode: 200 }
    }

    const a = all[idx]
    const b = all[swapIdx]
    await supabase.from("community_questions").update({ index: b.index }).eq("id", a.id)
    await supabase.from("community_questions").update({ index: a.index }).eq("id", b.id)

    const updated = [...all]
    updated[idx] = { ...a, index: b.index }
    updated[swapIdx] = { ...b, index: a.index }
    updated.sort((x, y) => x.index - y.index)

    const { data: full } = await supabase
      .from("community_questions")
      .select("*")
      .eq("community_id", question.community_id)
      .order("index", { ascending: true })

    return { data: full ?? [], error: undefined, message: "Order updated", statusCode: 200 }
  } catch (err) {
    console.error("Error moving community question:", err)
    return { error: "Error moving question", message: "Error moving question", statusCode: 500 }
  }
}

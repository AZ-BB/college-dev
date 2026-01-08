"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Save, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tables } from "@/database.types"
import {
    createTextBlock,
    getTextBlocksByCommunity,
    updateTextBlock,
    deleteTextBlock,
} from "@/action/community-text-blocks"
import { useRouter } from "next/navigation"

type TextBlock = Tables<"community_text_blocks">

export default function TextEditor({
    communityId,
    slug,
}: {
    communityId: number
    slug: string
}) {
    const router = useRouter()
    const [textBlocks, setTextBlocks] = useState<TextBlock[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Track local edits for each block
    const [localEdits, setLocalEdits] = useState<Record<number, { title: string; description: string }>>({})

    // Load text blocks on mount
    useEffect(() => {
        loadTextBlocks()
    }, [communityId])

    async function loadTextBlocks() {
        setIsLoading(true)
        const result = await getTextBlocksByCommunity(communityId)
        if (result.data) {
            setTextBlocks(result.data)
            // Initialize local edits with current values
            const edits: Record<number, { title: string; description: string }> = {}
            result.data.forEach((block) => {
                edits[block.id] = { title: block.title, description: block.description }
            })
            setLocalEdits(edits)
        }
        setIsLoading(false)
    }

    function handleInputChange(id: number, field: "title" | "description", value: string) {
        setLocalEdits((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }))
    }

    function hasChanges(id: number): boolean {
        const block = textBlocks.find((b) => b.id === id)
        if (!block) return false
        const edit = localEdits[id]
        if (!edit) return false
        return edit.title !== block.title || edit.description !== block.description
    }

    function cancelChanges(id: number) {
        // If it's a new block (negative ID) and empty, remove it
        if (id < 0) {
            setTextBlocks((prev) => prev.filter((b) => b.id !== id))
            setLocalEdits((prev) => {
                const newEdits = { ...prev }
                delete newEdits[id]
                return newEdits
            })
            return
        }

        // Otherwise, reset to original values
        const block = textBlocks.find((b) => b.id === id)
        if (block) {
            setLocalEdits((prev) => ({
                ...prev,
                [id]: { title: block.title, description: block.description },
            }))
        }
    }

    async function handleSave(id: number) {
        const edit = localEdits[id]
        if (!edit || !edit.title.trim() || !edit.description.trim()) {
            return
        }

        setIsSubmitting(true)

        const block = textBlocks.find((b) => b.id === id)
        if (!block) {
            setIsSubmitting(false)
            return
        }

        // Check if it's a new block (negative ID or not in database)
        if (id < 0) {
            // Create new block
            const nextIndex = textBlocks.filter((b) => b.id >= 0).length
            const result = await createTextBlock(
                communityId,
                edit.title,
                edit.description,
                nextIndex
            )

            if (result.error) {
                console.error("Error creating text block:", result.error)
                alert(result.error)
            } else {
                await loadTextBlocks()
                router.refresh()
            }
        } else {
            // Update existing block
            const result = await updateTextBlock(id, {
                title: edit.title,
                description: edit.description,
            })

            if (result.error) {
                console.error("Error updating text block:", result.error)
                alert(result.error)
            } else {
                await loadTextBlocks()
                router.refresh()
            }
        }

        setIsSubmitting(false)
    }

    async function handleDelete(id: number) {
        if (id < 0) {
            // Remove from local state if it's a new block
            setTextBlocks((prev) => prev.filter((b) => b.id !== id))
            setLocalEdits((prev) => {
                const newEdits = { ...prev }
                delete newEdits[id]
                return newEdits
            })
            return
        }

        if (!confirm("Are you sure you want to delete this text block?")) {
            return
        }

        const result = await deleteTextBlock(id)
        if (result.error) {
            console.error("Error deleting text block:", result.error)
            alert(result.error)
        } else {
            await loadTextBlocks()
            router.refresh()
        }
    }

    function handleAddNewBlock() {
        // Generate a temporary negative ID for new blocks
        const tempId = Date.now() * -1
        const nextIndex = textBlocks.filter((b) => b.id >= 0).length

        const newBlock: TextBlock = {
            id: tempId,
            community_id: communityId,
            title: "",
            description: "",
            index: nextIndex,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        setTextBlocks((prev) => [...prev, newBlock])
        setLocalEdits((prev) => ({
            ...prev,
            [tempId]: { title: "", description: "" },
        }))
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-gray-500">Loading text blocks...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Add New Block Button */}


            {/* All Text Blocks as Inputs */}
            {textBlocks.map((block) => {
                const edit = localEdits[block.id] || { title: "", description: "" }
                const hasUnsavedChanges = hasChanges(block.id)
                const isEmpty = !edit.title.trim() && !edit.description.trim()

                return (
                    <div
                        key={block.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative group"
                    >
                        <div className="absolute border border-gray-200 -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-white rounded-full p-0.5 hover:bg-gray-200">
                            <X className="size-4 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(block.id);
                            }} />
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Text Block {block.index + 1}
                            </h2>
                        </div>

                        {/* Heading Input */}
                        <div className="mb-4">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Add A Heading"
                                    value={edit.title}
                                    onChange={(e) => handleInputChange(block.id, "title", e.target.value)}
                                    maxLength={50}
                                    className="h-10 rounded-lg bg-[#F4F4F6] border border-[#F4F4F6] text-black placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40 pr-12"
                                />
                                <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none">
                                    {edit.title.length}/50
                                </div>
                            </div>
                        </div>

                        {/* Description Textarea */}
                        <div className="mb-4">
                            <div className="relative">
                                <textarea
                                    placeholder="Add a description"
                                    value={edit.description}
                                    onChange={(e) => handleInputChange(block.id, "description", e.target.value)}
                                    maxLength={1000}
                                    className="w-full h-24 rounded-lg bg-[#F4F4F6] border border-[#F4F4F6] text-black placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40 px-3 py-2 text-base resize-none outline-none"
                                />
                                <div className="absolute bottom-2 right-3 text-xs text-gray-500">
                                    {edit.description.length}/1000
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons at Bottom Right */}
                        {hasUnsavedChanges && (
                            <div className="flex justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant={'secondary'}
                                    onClick={() => cancelChanges(block.id)}
                                    disabled={isSubmitting}
                                    className="h-10 px-3 text-sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleSave(block.id)}
                                    disabled={isSubmitting || isEmpty}
                                    className="h-10 px-3 text-sm"
                                >
                                    {block.id < 0 ? "Add" : "Save"}
                                </Button>
                            </div>
                        )}
                    </div>
                )
            })}

            <button
                onClick={handleAddNewBlock}
                className="w-fit text-orange-500 hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
                + Add Text Block
            </button>
        </div>
    )
}

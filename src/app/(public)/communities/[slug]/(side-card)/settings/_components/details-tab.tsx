"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import EditIcon from "@/components/icons/edit"
import UploadIcon from "@/components/icons/upload"
import { AlertTriangle, ArrowRight, MoreVertical, Pencil, Plus, Trash2, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Fragment, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Community, addCtaLink, deleteCommunity, deleteCtaLink, getCommunityBySlug, isSlugAvailable, updateCommunityDetails, updateCommunitySlug, updateCtaLink } from "@/action/communities"
import {
    createCommunityQuestion,
    deleteCommunityQuestion,
    moveCommunityQuestion,
    updateCommunityQuestion,
} from "@/action/community-questions"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function DetailsTab({ slug }: { slug: string }) {
    const router = useRouter()
    const [isFetching, setIsFetching] = useState(false)

    const [community, setCommunity] = useState<Community>({} as Community)
    const [initialCommunity, setInitialCommunity] = useState<Community | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [supportEmailModalOpen, setSupportEmailModalOpen] = useState(false)
    const [supportEmailValue, setSupportEmailValue] = useState("")
    const [supportEmailSaving, setSupportEmailSaving] = useState(false)
    const [slugValue, setSlugValue] = useState("")
    const [slugSaving, setSlugSaving] = useState(false)
    const [slugError, setSlugError] = useState<string | null>(null)
    const [deleteCommunityModalOpen, setDeleteCommunityModalOpen] = useState(false)
    const [confirmDeleteName, setConfirmDeleteName] = useState("")
    const [deleteCommunityLoading, setDeleteCommunityLoading] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    const [linkModalOpen, setLinkModalOpen] = useState(false)
    const [editingLinkId, setEditingLinkId] = useState<number | null>(null)
    const [linkText, setLinkText] = useState("")
    const [linkUrl, setLinkUrl] = useState("")
    const [linkUrlError, setLinkUrlError] = useState<string | null>(null)
    const [linkSaving, setLinkSaving] = useState(false)

    type QuestionType = "TEXT" | "EMAIL" | "MULTIPLE_CHOICE"
    const [questionModalOpen, setQuestionModalOpen] = useState(false)
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)
    const [questionType, setQuestionType] = useState<QuestionType>("TEXT")
    const [questionText, setQuestionText] = useState("")
    const [questionOptions, setQuestionOptions] = useState<string[]>([""])
    const [questionSaving, setQuestionSaving] = useState(false)
    const [deleteQuestionModalOpen, setDeleteQuestionModalOpen] = useState(false)
    const [questionToDeleteId, setQuestionToDeleteId] = useState<number | null>(null)
    const [deleteQuestionLoading, setDeleteQuestionLoading] = useState(false)

    type InnerTab = "details" | "questions" | "links" | "url"
    const [innerTab, setInnerTab] = useState<InnerTab>("details")

    const isEdited =
        !!initialCommunity &&
        (community?.name !== initialCommunity?.name ||
            community?.description !== initialCommunity?.description ||
            community?.is_public !== initialCommunity?.is_public ||
            !!avatarFile ||
            !!coverFile)

    useEffect(() => {
        setIsFetching(true)
        getCommunityBySlug(slug).then((res) => {
            if (res.error || !res.data) {
                console.error(res.message ?? res.error ?? "Failed to load community")
                setIsFetching(false)
            } else {
                setCommunity(res.data)
                setInitialCommunity(res.data)
                setIsFetching(false)
            }
        })
    }, [slug])

    const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null)
    const [coverBlobUrl, setCoverBlobUrl] = useState<string | null>(null)

    useEffect(() => {
        if (avatarFile) {
            const url = URL.createObjectURL(avatarFile)
            setAvatarBlobUrl(url)
            return () => URL.revokeObjectURL(url)
        }
        setAvatarBlobUrl(null)
    }, [avatarFile])

    useEffect(() => {
        if (coverFile) {
            const url = URL.createObjectURL(coverFile)
            setCoverBlobUrl(url)
            return () => URL.revokeObjectURL(url)
        }
        setCoverBlobUrl(null)
    }, [coverFile])

    const avatarPreviewUrl = avatarBlobUrl ?? community?.avatar ?? null
    const coverPreviewUrl = coverBlobUrl ?? community?.cover_image ?? null

    async function handleSave() {
        if (!community?.id || !initialCommunity) return
        setIsLoading(true)
        let newAvatar: string | null = community?.avatar ?? null
        let newCover: string | null = community?.cover_image ?? null
        try {
            if (avatarFile) {
                const formData = new FormData()
                formData.set("file", avatarFile)
                formData.set("commSlug", slug)
                const res = await fetch("/api/commuinty/upload-avatar", { method: "POST", body: formData })
                const data = await res.json()
                if (!res.ok) throw new Error(data?.error ?? "Failed to upload avatar")
                newAvatar = data.url
            }
            if (coverFile) {
                const formData = new FormData()
                formData.set("file", coverFile)
                formData.set("commSlug", slug)
                const res = await fetch("/api/commuinty/upload-cover", { method: "POST", body: formData })
                const data = await res.json()
                if (!res.ok) throw new Error(data?.error ?? "Failed to upload cover")
                newCover = data.url
            }
            const updateRes = await updateCommunityDetails(community.id, {
                name: community.name ?? "",
                description: community.description ?? "",
                is_public: community.is_public,
            })
            if (updateRes.error) throw new Error(updateRes.message ?? updateRes.error)
            const nextCommunity = { ...community, avatar: newAvatar, cover_image: newCover }
            setCommunity(nextCommunity)
            setInitialCommunity(nextCommunity)
            setAvatarFile(null)
            setCoverFile(null)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    function openSupportEmailModal() {
        setSupportEmailValue(community?.support_email ?? "")
        setSupportEmailModalOpen(true)
    }

    function goToUrlTab() {
        setSlugValue(community?.slug ?? "")
        setSlugError(null)
        setInnerTab("url")
    }

    async function handleSlugConfirm() {
        if (!community?.id) return
        setSlugError(null)
        const trimmed = slugValue.trim()
        if (!trimmed) {
            setSlugError("URL slug is required.")
            return
        }
        const res = await isSlugAvailable(trimmed, community.id)
        if (res.error || res.data === false) {
            setSlugError(res.message ?? "Another community already uses this URL.")
            return
        }
        setSlugSaving(true)
        try {
            const updateRes = await updateCommunitySlug(community.id, trimmed)
            if (updateRes.error || !updateRes.data) {
                setSlugError(updateRes.message ?? "Failed to update URL.")
                return
            }
            router.push(`/communities/${updateRes.data}/settings`)
        } finally {
            setSlugSaving(false)
        }
    }

    async function handleSupportEmailConfirm() {
        if (!community?.id) return
        setSupportEmailSaving(true)
        try {
            const res = await updateCommunityDetails(community.id, {
                name: community.name ?? "",
                description: community.description ?? "",
                is_public: community.is_public,
                support_email: supportEmailValue.trim() || null,
            })
            if (res.error) throw new Error(res.message ?? res.error)
            setCommunity((c) => ({ ...c, support_email: supportEmailValue.trim() || null }))
            setInitialCommunity((prev) => (prev ? { ...prev, support_email: supportEmailValue.trim() || null } : null))
            setSupportEmailModalOpen(false)
        } catch (err) {
            console.error(err)
        } finally {
            setSupportEmailSaving(false)
        }
    }

    function openDeleteCommunityModal() {
        setConfirmDeleteName("")
        setDeleteCommunityModalOpen(true)
    }

    async function handleDeleteCommunity() {
        if (!community?.id || confirmDeleteName.trim() !== (community?.name ?? "")) return
        setDeleteCommunityLoading(true)
        try {
            const res = await deleteCommunity({ id: community.id })
            if (res.error) throw new Error(res.message ?? res.error)
            setDeleteCommunityModalOpen(false)
            router.push("/communities")
        } catch (err) {
            console.error(err)
        } finally {
            setDeleteCommunityLoading(false)
        }
    }

    const ctaLinks = community?.community_cta_links ?? []

    function openAddLinkModal() {
        setEditingLinkId(null)
        setLinkText("")
        setLinkUrl("")
        setLinkModalOpen(true)
    }

    function openEditLinkModal(link: { id: number; text: string; url: string }) {
        setEditingLinkId(link.id)
        setLinkText(link.text)
        setLinkUrl(link.url)
        setLinkModalOpen(true)
    }

    function closeLinkModal() {
        setLinkModalOpen(false)
        setEditingLinkId(null)
        setLinkText("")
        setLinkUrl("")
        setLinkUrlError(null)
    }

    function validateLinkUrl(value: string): { valid: true; url: string } | { valid: false; error: string } {
        const trimmed = value.trim()
        if (!trimmed) return { valid: false, error: "URL is required." }
        let toTest = trimmed
        if (!/^https?:\/\//i.test(trimmed)) toTest = `https://${trimmed}`
        try {
            const parsed = new URL(toTest)
            if (!["http:", "https:"].includes(parsed.protocol)) {
                return { valid: false, error: "URL must use http or https." }
            }
            return { valid: true, url: toTest }
        } catch {
            return { valid: false, error: "Please enter a valid link (e.g. https://example.com)." }
        }
    }

    function handleLinkUrlBlur() {
        if (!linkUrl.trim()) {
            setLinkUrlError(null)
            return
        }
        const result = validateLinkUrl(linkUrl)
        setLinkUrlError(result.valid ? null : result.error)
    }

    async function handleSaveLink() {
        if (!community?.id) return
        const text = linkText.trim()
        if (!text) return
        const urlResult = validateLinkUrl(linkUrl)
        if (!urlResult.valid) {
            setLinkUrlError(urlResult.error)
            return
        }
        setLinkUrlError(null)
        const url = urlResult.url
        setLinkSaving(true)
        try {
            if (editingLinkId !== null) {
                const res = await updateCtaLink(editingLinkId, { text, url })
                if (res.error || !res.data) throw new Error(res.message ?? res.error)
                setCommunity((c) => ({
                    ...c,
                    community_cta_links: ctaLinks.map((l) => (l.id === editingLinkId ? res.data! : l)),
                }))
            } else {
                const res = await addCtaLink(community.id, { text, url })
                if (res.error || !res.data) throw new Error(res.message ?? res.error)
                setCommunity((c) => ({
                    ...c,
                    community_cta_links: [...ctaLinks, res.data!],
                }))
            }
            closeLinkModal()
        } catch (err) {
            console.error(err)
        } finally {
            setLinkSaving(false)
        }
    }

    async function handleDeleteLink(linkId: number) {
        try {
            const res = await deleteCtaLink(linkId)
            if (res.error) throw new Error(res.message ?? res.error)
            setCommunity((c) => ({
                ...c,
                community_cta_links: ctaLinks.filter((l) => l.id !== linkId),
            }))
        } catch (err) {
            console.error(err)
        }
    }

    const communityQuestions = (community?.community_questions ?? []).slice().sort((a, b) => a.index - b.index)
    const questionTypeLabel: Record<QuestionType, string> = {
        TEXT: "Text",
        EMAIL: "Email",
        MULTIPLE_CHOICE: "Multiple Choice",
    }

    function getQuestionDisplay(q: (typeof communityQuestions)[0]) {
        if (q.type === "MULTIPLE_CHOICE") {
            try {
                const parsed = JSON.parse(q.content) as { question?: string; options?: string[] }
                return { text: parsed.question ?? q.content, options: parsed.options ?? [] }
            } catch {
                return { text: q.content, options: [] }
            }
        }
        return { text: q.content, options: [] }
    }

    function openAddQuestion() {
        setEditingQuestionId(null)
        setQuestionType("TEXT")
        setQuestionText("")
        setQuestionOptions([""])
        setQuestionModalOpen(true)
    }

    function openEditQuestion(q: (typeof communityQuestions)[0]) {
        setEditingQuestionId(q.id)
        setQuestionType(q.type as QuestionType)
        if (q.type === "MULTIPLE_CHOICE") {
            try {
                const parsed = JSON.parse(q.content) as { question?: string; options?: string[] }
                setQuestionText(parsed.question ?? "")
                setQuestionOptions(
                    parsed.options?.length ? parsed.options : [""]
                )
            } catch {
                setQuestionText(q.content)
                setQuestionOptions([""])
            }
        } else {
            setQuestionText(q.content)
            setQuestionOptions([""])
        }
        setQuestionModalOpen(true)
    }

    function closeQuestionModal() {
        setQuestionModalOpen(false)
        setEditingQuestionId(null)
        setQuestionType("TEXT")
        setQuestionText("")
        setQuestionOptions([""])
    }

    async function handleSaveQuestion() {
        if (!community?.id) return
        const isMcq = questionType === "MULTIPLE_CHOICE"
        const content = isMcq
            ? JSON.stringify({
                  question: questionText.trim(),
                  options: questionOptions.filter(Boolean),
              })
            : questionText.trim()
        if (!content || (isMcq && questionOptions.filter(Boolean).length === 0)) return
        setQuestionSaving(true)
        try {
            if (editingQuestionId !== null) {
                const res = await updateCommunityQuestion(editingQuestionId, {
                    content,
                    type: questionType,
                })
                if (res.error || !res.data) throw new Error(res.message ?? res.error)
                setCommunity((c) => ({
                    ...c,
                    community_questions: (c.community_questions ?? []).map((q) =>
                        q.id === editingQuestionId ? res.data! : q
                    ),
                }))
            } else {
                const index = communityQuestions.length
                const res = await createCommunityQuestion(community.id, {
                    content,
                    type: questionType,
                    index,
                })
                if (res.error || !res.data) throw new Error(res.message ?? res.error)
                setCommunity((c) => ({
                    ...c,
                    community_questions: [...(c.community_questions ?? []), res.data!].sort(
                        (a, b) => a.index - b.index
                    ),
                }))
            }
            closeQuestionModal()
        } catch (err) {
            console.error(err)
        } finally {
            setQuestionSaving(false)
        }
    }

    function openDeleteQuestionModal(questionId: number) {
        setQuestionToDeleteId(questionId)
        setDeleteQuestionModalOpen(true)
    }

    async function handleConfirmDeleteQuestion() {
        if (questionToDeleteId === null) return
        setDeleteQuestionLoading(true)
        try {
            const res = await deleteCommunityQuestion(questionToDeleteId)
            if (res.error) throw new Error(res.message ?? res.error)
            setCommunity((c) => ({
                ...c,
                community_questions: (c.community_questions ?? []).filter((q) => q.id !== questionToDeleteId),
            }))
            setDeleteQuestionModalOpen(false)
            setQuestionToDeleteId(null)
        } catch (err) {
            console.error(err)
        } finally {
            setDeleteQuestionLoading(false)
        }
    }

    async function handleMoveQuestion(questionId: number, direction: "up" | "down") {
        try {
            const res = await moveCommunityQuestion(questionId, direction)
            if (res.error || !res.data) throw new Error(res.message ?? res.error)
            setCommunity((c) => ({ ...c, community_questions: res.data }))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {innerTab === "questions" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setInnerTab("details")}
                                className="w-fit -ml-2 flex items-center gap-2 text-base sm:text-sm font-medium text-grey-700 hover:text-grey-900 rounded-lg size-9 p-0"
                                aria-label="Back"
                            >
                                <ArrowRight className="size-4 rotate-180" />
                            </Button>
                            <span className="text-xl sm:text-lg font-semibold text-grey-900">
                                Member Questions
                            </span>
                        </div>
                        <Button
                            type="button"
                            onClick={openAddQuestion}
                            className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-base sm:text-sm font-semibold py-5 px-5"
                        >
                            Add New
                        </Button>
                    </div>

                    <div className="rounded-lg">
                        {communityQuestions.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-grey-300 bg-grey-50/50 p-8 text-center text-base sm:text-sm text-grey-500">
                                No questions yet. Click &quot;Add New&quot; to add a member question.
                            </div>
                        ) : (
                            communityQuestions.map((q, idx) => {
                                const display = getQuestionDisplay(q)
                                const typeLabel = questionTypeLabel[q.type as QuestionType] ?? q.type
                                return (
                                    <Fragment key={q.id}>
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 py-4 bg-white hover:bg-grey-50/50 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-grey-500 font-medium mb-3">{typeLabel}</p>
                                                <p className="text-base sm:text-base font-semibold text-grey-900 mt-0.5">
                                                    {display.text || "Question"}
                                                </p>
                                                {q.type === "MULTIPLE_CHOICE" && display.options.length > 0 && (
                                                    <div className="mt-2 list-disc text-base sm:text-sm text-grey-700 space-y-0.5">
                                                        {display.options.map((opt, i) => (
                                                            <div key={i}>- {opt}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditQuestion(q)}
                                                    className="rounded-lg size-9 border-grey-300 text-grey-700 hover:bg-grey-100"
                                                    aria-label="Edit question"
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="rounded-lg size-9 border-grey-300 text-grey-700 hover:bg-grey-100"
                                                            aria-label="More options"
                                                        >
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleMoveQuestion(q.id, "up")}
                                                            disabled={idx === 0}
                                                        >
                                                            Move up
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleMoveQuestion(q.id, "down")}
                                                            disabled={idx === communityQuestions.length - 1}
                                                        >
                                                            Move down
                                                        </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() => openDeleteQuestionModal(q.id)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        {idx < communityQuestions.length - 1 && (
                                            <Separator className="bg-grey-200" />
                                        )}
                                    </Fragment>
                                )
                            })
                        )}
                    </div>

                    <Dialog
                        open={questionModalOpen}
                        onOpenChange={(open) => !open && closeQuestionModal()}
                    >
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingQuestionId !== null ? "Edit question" : "Add question"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-grey-900" htmlFor="question-type">
                                        Answer type
                                    </label>
                                    <Select
                                        value={questionType}
                                        onValueChange={(value) => setQuestionType(value as QuestionType)}
                                    >
                                        <SelectTrigger
                                            id="question-type"
                                            variant="outline"
                                            className="w-full rounded-lg border-grey-300 bg-grey-50 text-base sm:text-sm text-grey-900 h-10"
                                        >
                                            <SelectValue placeholder="Select answer type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TEXT">Plain text answer</SelectItem>
                                            <SelectItem value="EMAIL">Email</SelectItem>
                                            <SelectItem value="MULTIPLE_CHOICE">Multiple choice (MCQ)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-grey-900" htmlFor="question-text">
                                        Question
                                    </label>
                                    <Input
                                        id="question-text"
                                        type="text"
                                        placeholder="e.g. Why do you want to join?"
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                    />
                                </div>
                                {questionType === "MULTIPLE_CHOICE" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-grey-900">
                                            Options
                                        </label>
                                        <div className="space-y-2">
                                            {questionOptions.map((opt, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <Input
                                                        type="text"
                                                        placeholder={`Option ${i + 1}`}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const next = [...questionOptions]
                                                            next[i] = e.target.value
                                                            setQuestionOptions(next)
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="icon"
                                                        onClick={() =>
                                                            setQuestionOptions(questionOptions.filter((_, j) => j !== i))
                                                        }
                                                        disabled={questionOptions.length <= 1}
                                                        className="rounded-lg size-9 shrink-0 border-grey-300 text-grey-700"
                                                        aria-label="Remove option"
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setQuestionOptions([...questionOptions, ""])}
                                                className="rounded-lg text-grey-700 py-5"
                                            >
                                                <Plus className="size-4 mr-1" />
                                                Add option
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeQuestionModal}
                                        disabled={questionSaving}
                                        className="rounded-lg"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSaveQuestion}
                                        disabled={
                                            questionSaving ||
                                            !questionText.trim() ||
                                            (questionType === "MULTIPLE_CHOICE" &&
                                                questionOptions.filter(Boolean).length === 0)
                                        }
                                        className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                                    >
                                        {questionSaving
                                            ? "Saving…"
                                            : editingQuestionId !== null
                                              ? "Save"
                                              : "Add"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={deleteQuestionModalOpen}
                        onOpenChange={(open) => {
                            setDeleteQuestionModalOpen(open)
                            if (!open) setQuestionToDeleteId(null)
                        }}
                    >
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Delete this question?</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-grey-600 pt-1">
                                This action cannot be undone. The question will be removed from your member questions.
                            </p>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDeleteQuestionModalOpen(false)}
                                    disabled={deleteQuestionLoading}
                                    className="rounded-lg"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleConfirmDeleteQuestion}
                                    disabled={deleteQuestionLoading}
                                    className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {deleteQuestionLoading ? "Deleting…" : "Delete"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {innerTab === "links" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setInnerTab("details")}
                                className="w-fit -ml-2 flex items-center gap-2 text-base sm:text-sm font-medium text-grey-700 hover:text-grey-900"
                            >
                                <ArrowRight className="size-4 rotate-180" />
                            </Button>
                            <span className="text-xl sm:text-lg font-semibold text-grey-900">Add Links</span>
                        </div>
                        <Button
                            type="button"
                            onClick={openAddLinkModal}
                            className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-base sm:text-sm font-semibold py-5 px-5"
                        >
                            Add New
                        </Button>
                    </div>

                    <div className="rounded-lg border border-grey-200 divide-y divide-grey-200 overflow-hidden">
                        {ctaLinks.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-grey-300 bg-grey-50/50 p-8 text-center text-base sm:text-sm text-grey-500">
                                No links yet. Click &quot;Add New&quot; to add a link to your info box.
                            </div>
                        ) : (
                            ctaLinks.map((link) => (
                                <div
                                    key={link.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-white hover:bg-grey-50/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base sm:text-sm font-semibold text-grey-900 truncate">
                                            {link.text || "Link Name"}
                                        </p>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-base sm:text-sm text-orange-500 hover:text-orange-600 hover:underline truncate block"
                                        >
                                            {link.url}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => openEditLinkModal(link)}
                                            className="rounded-lg size-9 border-grey-300 text-grey-700 hover:bg-grey-100"
                                            aria-label="Edit link"
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDeleteLink(link.id)}
                                            className="rounded-lg size-9 border-grey-300 text-red-600 hover:bg-red-50 hover:border-red-200"
                                            aria-label="Delete link"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Dialog open={linkModalOpen} onOpenChange={(open) => !open && closeLinkModal()}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingLinkId !== null ? "Edit link" : "Add link"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-grey-900" htmlFor="link-text-input">
                                        Link name
                                    </label>
                                    <Input
                                        id="link-text-input"
                                        type="text"
                                        placeholder="Name your link"
                                        value={linkText}
                                        onChange={(e) => setLinkText(e.target.value)}
                                        className="rounded-lg bg-grey-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-grey-900" htmlFor="link-url-input">
                                        URL
                                    </label>
                                    <Input
                                        id="link-url-input"
                                        type="url"
                                        placeholder="https://..."
                                        value={linkUrl}
                                        onChange={(e) => {
                                            setLinkUrl(e.target.value)
                                            setLinkUrlError(null)
                                        }}
                                        onBlur={handleLinkUrlBlur}
                                        className={cn("rounded-lg bg-grey-200", linkUrlError && "border-red-500 focus-visible:ring-red-500")}
                                        aria-invalid={!!linkUrlError}
                                        aria-describedby={linkUrlError ? "link-url-error" : undefined}
                                    />
                                    {linkUrlError && (
                                        <p id="link-url-error" className="text-sm text-red-600" role="alert">
                                            {linkUrlError}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeLinkModal}
                                        disabled={linkSaving}
                                        className="rounded-lg"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSaveLink}
                                        disabled={linkSaving || !linkText.trim() || !linkUrl.trim() || !!linkUrlError}
                                        className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                                    >
                                        {linkSaving ? "Saving…" : editingLinkId !== null ? "Save" : "Add"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {innerTab === "url" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setInnerTab("details")}
                            className="w-fit -ml-2 flex items-center gap-2 text-base sm:text-sm font-medium text-grey-700 hover:text-grey-900"
                        >
                            <ArrowRight className="size-4 rotate-180" />
                        </Button>
                        <span className="text-xl sm:text-lg font-semibold text-grey-900">Change URL</span>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-base sm:text-sm font-medium text-grey-900" htmlFor="slug-input">
                                URL
                            </label>
                            <div className="flex items-center gap-2 rounded-lg bg-grey-200 px-3 border border-transparent focus-within:border-grey-400 max-w-md">
                                <span className="text-base sm:text-sm text-grey-500 shrink-0">{process.env.NEXT_PUBLIC_APP_URL}/</span>
                                <input
                                    id="slug-input"
                                    type="text"
                                    placeholder="my-community"
                                    value={slugValue}
                                    onChange={(e) => { setSlugValue(e.target.value); setSlugError(null) }}
                                    className="flex-1 min-w-0 py-2 bg-transparent text-base sm:text-sm outline-none placeholder:text-grey-400"
                                    autoComplete="off"
                                />
                            </div>
                            {slugError && (
                                <div className="flex items-center gap-2">
                                    <div className="size-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                                        <X className="size-3" />
                                    </div>
                                    <p className="text-base sm:text-sm text-red-600" role="alert">{slugError}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-base sm:text-sm font-medium text-grey-900">Things to know</p>

                            <ul className="text-base sm:text-sm text-grey-600 list-disc list-inside space-y-1">
                                <li>Old links will redirect to the new URL</li>
                                <li>Members may get confused if the URL changes often</li>
                                <li>This URL is part of your community’s public identity - treat it like a business decision</li>
                            </ul>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setInnerTab("details")}
                                disabled={slugSaving}
                                className="rounded-lg text-base sm:text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSlugConfirm}
                                disabled={slugSaving}
                                className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-base sm:text-sm"
                            >
                                {slugSaving ? "Saving…" : "Claim URL"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {innerTab === "details" && (
                <>
                    {/* Icon */}
                    <div className="flex flex-row items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-lg sm:text-base font-semibold text-grey-900">Icon</p>
                            <p className="text-base sm:text-sm text-grey-600 font-medium">Recommended: 120 x 120</p>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0]
                                    if (f) setAvatarFile(f)
                                    e.target.value = ""
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="text-base sm:text-sm font-medium text-orange-500 hover:underline flex items-center gap-1 w-fit"
                            >
                                Change
                                <EditIcon className="size-4 stroke-orange-500" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                            {
                                isFetching ? (
                                    <Skeleton className="size-[120px] rounded-lg" />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="size-[120px] rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 flex items-center justify-center overflow-hidden hover:border-grey-400 transition-colors"
                                    >
                                        {avatarPreviewUrl ? (
                                            <Image src={avatarPreviewUrl} alt="Avatar" width={120} height={120} className="size-[120px] object-cover" unoptimized />
                                        ) : (
                                            <UploadIcon className="size-6 text-orange-500 stroke-orange-500" />
                                        )}
                                    </button>
                                )
                            }
                        </div>
                    </div>

                    <Separator className="w-full opacity-50" />

                    {/* Cover */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div>
                                <p className="text-lg sm:text-base font-semibold text-grey-900">Cover</p>
                                <p className="text-base sm:text-sm text-grey-600 font-medium">Recommended: 1920 x 1080</p>
                            </div>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0]
                                    if (f) setCoverFile(f)
                                    e.target.value = ""
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                className="text-base sm:text-sm font-medium text-orange-500 hover:underline flex items-center gap-1 w-fit"
                            >
                                Change
                                <EditIcon className="size-4 stroke-orange-500" />
                            </button>
                        </div>

                        <div className="sm:w-[214px] sm:h-[120px] w-full aspect-video">
                            {
                                isFetching ? (
                                    <Skeleton className="w-full aspect-video rounded-lg max-w-full" />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => coverInputRef.current?.click()}
                                        className="relative w-full aspect-video max-w-full rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 flex items-center justify-center overflow-hidden hover:border-grey-400 transition-colors"
                                    >
                                        {coverPreviewUrl ? (
                                            <Image src={coverPreviewUrl} alt="Cover" fill className="object-cover rounded-lg" unoptimized />
                                        ) : (
                                            <UploadIcon className="size-8 text-orange-500 stroke-orange-500 shrink-0" />
                                        )}
                                    </button>
                                )
                            }
                        </div>
                    </div>

                    <Separator className="w-full opacity-50" />

                    {/* Community Name */}
                    <div>
                        <label className="text-base sm:text-sm font-medium text-grey-900 block mb-1">
                            Community Name
                        </label>
                        <div className="relative">
                            <Input
                                value={community?.name ?? ""}
                                onChange={(e) => setCommunity({ ...community, name: e.target.value })}
                                maxLength={30}
                                className="rounded-md bg-grey-200 pr-12 text-base sm:text-sm"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm sm:text-xs text-grey-500">
                                {community?.name?.length ?? 0}/30
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-base sm:text-sm font-medium text-grey-900 block mb-1">
                            Description
                        </label>
                        <div className="relative">
                            <Textarea
                                value={community?.description ?? ""}
                                onChange={(e) => setCommunity({ ...community, description: e.target.value })}
                                placeholder="Placeholder"
                                maxLength={150}
                                rows={4}
                                className="rounded-lg bg-grey-200 pr-12 resize-none text-base sm:text-sm"
                            />
                            <span className="absolute bottom-2 right-3 text-sm sm:text-xs text-grey-500">
                                {community?.description?.length ?? 0}/150
                            </span>
                        </div>
                    </div>

                    {/* URL */}
                    <div className="gap-3">
                        <div>
                            <label className="text-base sm:text-sm font-medium text-grey-900">
                                URL
                            </label>
                        </div>
                        <div className="flex items-start gap-2 sm:flex-row flex-col">
                            <Input
                                value={`${process.env.NEXT_PUBLIC_APP_URL}/${community?.slug}`}
                                readOnly
                                className="rounded-lg bg-grey-200 w-full text-base sm:text-sm"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                className="rounded-lg w-fit text-base sm:text-sm font-semibold bg-grey-200 hover:bg-grey-300 text-grey-900 py-5 px-5"
                                onClick={goToUrlTab}
                            >
                                Change URL
                            </Button>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setInnerTab("questions")}
                            className="rounded-lg text-base sm:text-sm py-5 flex items-center justify-between gap-2 flex-1 min-w-[200px] border-grey-300"
                        >
                            Add membership questions
                            <ArrowRight className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setInnerTab("links")}
                            className="rounded-lg text-base sm:text-sm py-5 flex items-center justify-between gap-2 flex-1 min-w-[200px] border-grey-300"
                        >
                            Add links to your info box
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>

                    <Separator className="w-full opacity-50" />

                    {/* Private / Public visibility cards */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div
                            onClick={() => setCommunity({ ...community, is_public: !community?.is_public })}
                            className={cn(
                                "cursor-pointer flex flex-col gap-1 flex-1 min-w-0 border p-4 rounded-xl hover:border-orange-500 transition-all duration-300",
                                !community?.is_public ? "border-2 border-orange-500 bg-orange-50" : "border-grey-200 bg-grey-50/50"
                            )}
                        >
                            <p className="text-lg sm:text-base font-semibold text-grey-900">Private</p>
                            <p className="text-base sm:text-sm font-medium text-grey-600">Only members can see who&apos;s in the community and what they share. Content is hidden from search engine.</p>
                        </div>
                        <div
                            onClick={() => setCommunity({ ...community, is_public: true })}
                            className={cn(
                                "cursor-pointer flex flex-col gap-1 flex-1 min-w-0 border p-4 rounded-xl hover:border-orange-500 transition-all duration-300",
                                community?.is_public ? "border-2 border-orange-500 bg-orange-50" : "border-grey-200 bg-grey-50/50"
                            )}
                        >
                            <p className="text-lg sm:text-base font-semibold text-grey-900">Public</p>
                            <p className="text-base sm:text-sm font-medium text-grey-600">Anyone can see the community and what they post. Content is discoverable by search engines.</p>
                        </div>
                    </div>

                    {/* Support Email */}
                    <div className="flex flex-col gap-1 pt-2">
                        <span className="text-base sm:text-sm font-semibold text-grey-900">Support Email</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base sm:text-sm text-grey-600">{community?.support_email ?? "No support email set"}</span>
                            <button
                                type="button"
                                onClick={openSupportEmailModal}
                                className="shrink-0 rounded-full p-1.5 bg-orange-50 hover:bg-orange-100 transition-colors"
                                aria-label="Edit support email"
                            >
                                <EditIcon className="size-4 stroke-orange-500" />
                            </button>
                        </div>
                    </div>

                    {/* Delete Community */}
                    <div className="flex items-center justify-end pt-6">
                        <Button
                            variant="ghost"
                            className="text-base sm:text-sm text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
                            onClick={openDeleteCommunityModal}
                        >
                            Delete Community
                        </Button>
                    </div>

                    <Dialog open={supportEmailModalOpen} onOpenChange={setSupportEmailModalOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Support Email</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-grey-900" htmlFor="support-email-input">
                                        Email address
                                    </label>
                                    <Input
                                        id="support-email-input"
                                        type="email"
                                        placeholder="support@example.com"
                                        value={supportEmailValue}
                                        onChange={(e) => setSupportEmailValue(e.target.value)}
                                        className="rounded-lg bg-grey-200"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSupportEmailModalOpen(false)}
                                        disabled={supportEmailSaving}
                                        className="rounded-lg"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSupportEmailConfirm}
                                        disabled={supportEmailSaving}
                                        className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                                    >
                                        {supportEmailSaving ? "Saving…" : "Confirm"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={deleteCommunityModalOpen}
                        onOpenChange={(open) => {
                            setDeleteCommunityModalOpen(open)
                            if (!open) setConfirmDeleteName("")
                        }}
                    >
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                                <DialogTitle className="text-xl font-bold">Delete this community</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="rounded-lg bg-amber-100 border border-amber-200 p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="size-5 text-amber-700 shrink-0" aria-hidden />
                                        <span className="font-bold text-amber-900">WARNING</span>
                                    </div>
                                    <ul className="text-sm text-amber-900 list-disc list-inside space-y-1 ml-0.5">
                                        <li>Nobody will be able to discover or join anymore.</li>
                                        <li>
                                            You will lose your custom URL{" "}
                                            <span className="font-medium">
                                                {typeof process.env.NEXT_PUBLIC_APP_URL !== "undefined" ? `${process.env.NEXT_PUBLIC_APP_URL}/${community?.slug ?? ""}` : ""}
                                            </span>{" "}
                                            and it will be available for others to claim.
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-grey-900">
                                        To delete your community, the following must be completed first:
                                    </p>
                                    <ul className="text-sm text-grey-700 list-disc list-inside space-y-1">
                                        <li>Remove all members from here</li>
                                        <li>Remove all admins</li>
                                    </ul>
                                    <p className="text-sm text-grey-600">
                                        This is to prevent accidental deletion and protect community data.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-grey-900">Type the community name to confirm deletion.</p>
                                    <Input
                                        type="text"
                                        placeholder="Community Name"
                                        value={confirmDeleteName}
                                        onChange={(e) => setConfirmDeleteName(e.target.value)}
                                        className="rounded-lg bg-grey-200"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setDeleteCommunityModalOpen(false)}
                                        disabled={deleteCommunityLoading}
                                        className="rounded-lg w-1/2 py-6"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDeleteCommunity}
                                        disabled={confirmDeleteName.trim() !== (community?.name ?? "") || deleteCommunityLoading}
                                        className="rounded-lg bg-red-600 hover:bg-red-700 text-white w-1/2 py-6"
                                    >
                                        {deleteCommunityLoading ? "Deleting…" : "Delete"}
                                    </Button>
                                </div>
                                <p className="text-xs text-grey-500">This action is permanent and cannot be undone.</p>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {isEdited && (
                        <div className="pt-2">
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={isLoading}
                                className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                {isLoading ? "Saving…" : "Save"}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

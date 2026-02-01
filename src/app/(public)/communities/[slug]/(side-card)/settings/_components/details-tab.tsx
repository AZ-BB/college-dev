"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import EditIcon from "@/components/icons/edit"
import UploadIcon from "@/components/icons/upload"
import { ArrowRight, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Community, getCommunityBySlug, isSlugAvailable, updateCommunityDetails, updateCommunitySlug } from "@/action/communities"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

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

    return (
        <div className="flex flex-col gap-6">
            {innerTab === "questions" && (
                <div className="flex flex-col gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInnerTab("details")}
                        className="w-fit -ml-2 flex items-center gap-2 text-sm font-medium text-grey-700 hover:text-grey-900"
                    >
                        <ArrowRight className="size-4 rotate-180" />
                        Add Links
                    </Button>
                    <div className="rounded-lg border border-dashed border-grey-300 bg-grey-50/50 p-8 text-center text-sm text-grey-500">
                        Membership questions content — coming soon.
                    </div>
                </div>
            )}

            {innerTab === "links" && (
                <div className="flex flex-col gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInnerTab("details")}
                        className="w-fit -ml-2 flex items-center gap-2 text-sm font-medium text-grey-700 hover:text-grey-900"
                    >
                        <ArrowRight className="size-4 rotate-180" />
                    </Button>
                    <div className="rounded-lg border border-dashed border-grey-300 bg-grey-50/50 p-8 text-center text-sm text-grey-500">
                        Info box links content — coming soon.
                    </div>
                </div>
            )}

            {innerTab === "url" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setInnerTab("details")}
                            className="w-fit -ml-2 flex items-center gap-2 text-sm font-medium text-grey-700 hover:text-grey-900"
                        >
                            <ArrowRight className="size-4 rotate-180" />
                        </Button>
                        <span className="text-lg font-semibold text-grey-900">Change URL</span>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-grey-900" htmlFor="slug-input">
                                URL
                            </label>
                            <div className="flex items-center gap-2 rounded-lg bg-grey-200 px-3 border border-transparent focus-within:border-grey-400 max-w-md">
                                <span className="text-sm text-grey-500 shrink-0">{process.env.NEXT_PUBLIC_APP_URL}/</span>
                                <input
                                    id="slug-input"
                                    type="text"
                                    placeholder="my-community"
                                    value={slugValue}
                                    onChange={(e) => { setSlugValue(e.target.value); setSlugError(null) }}
                                    className="flex-1 min-w-0 py-2 bg-transparent text-sm outline-none placeholder:text-grey-400"
                                    autoComplete="off"
                                />
                            </div>
                            {slugError && (
                                <div className="flex items-center gap-2">
                                    <div className="size-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                                        <X className="size-3" />
                                    </div>
                                    <p className="text-sm text-red-600" role="alert">{slugError}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-grey-900">Things to know</p>

                            <ul className="text-sm text-grey-600 list-disc list-inside space-y-1">
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
                                className="rounded-lg text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSlugConfirm}
                                disabled={slugSaving}
                                className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm"
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
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold text-grey-900">Icon</p>
                            <p className="text-sm text-grey-600 font-medium">Recommended: 120 x 120</p>
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
                                className="text-sm font-medium text-orange-500 hover:underline flex items-center gap-1"
                            >
                                Change
                                <EditIcon className="size-4 stroke-orange-500" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {
                                isFetching ? (
                                    <Skeleton className="size-20 rounded-lg" />
                                ) : (
                                    <div className="size-20 rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 flex items-center justify-center overflow-hidden">
                                        {avatarPreviewUrl ? (
                                            <Image src={avatarPreviewUrl} alt="Avatar" width={80} height={80} className="size-20 object-cover" unoptimized />
                                        ) : (
                                            <UploadIcon className="size-6 text-orange-500 stroke-orange-500" />
                                        )}
                                    </div>
                                )
                            }
                        </div>
                    </div>

                    <Separator className="w-full opacity-50" />

                    {/* Cover */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold text-grey-900">Cover</p>
                            <p className="text-sm text-grey-600 font-medium">Recommended: 1920 x 1080</p>
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
                                className="text-sm font-medium text-orange-500 hover:underline flex items-center gap-1"
                            >
                                Change
                                <EditIcon className="size-4 stroke-orange-500" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {
                                isFetching ? (
                                    <Skeleton className="w-[214px] h-[120px] rounded-lg" />
                                ) : (
                                    <div className="w-[214px] h-[120px] rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 flex items-center justify-center overflow-hidden">
                                        {coverPreviewUrl ? (
                                            <Image src={coverPreviewUrl} alt="Cover" width={214} height={120} className="w-[214px] h-[120px] object-cover" unoptimized />
                                        ) : (
                                            <UploadIcon className="size-6 text-orange-500 stroke-orange-500" />
                                        )}
                                    </div>
                                )
                            }

                        </div>
                    </div>

                    <Separator className="w-full opacity-50" />

                    {/* Community Name */}
                    <div>
                        <label className="text-sm font-medium text-grey-900 block mb-1">
                            Community Name
                        </label>
                        <div className="relative">
                            <Input
                                value={community?.name ?? ""}
                                onChange={(e) => setCommunity({ ...community, name: e.target.value })}
                                maxLength={30}
                                className="rounded-md bg-grey-200 pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-grey-500">
                                {community?.name?.length ?? 0}/30
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-grey-900 block mb-1">
                            Description
                        </label>
                        <div className="relative">
                            <Textarea
                                value={community?.description ?? ""}
                                onChange={(e) => setCommunity({ ...community, description: e.target.value })}
                                placeholder="Placeholder"
                                maxLength={150}
                                rows={4}
                                className="rounded-lg bg-grey-200 pr-12 resize-none"
                            />
                            <span className="absolute bottom-2 right-3 text-xs text-grey-500">
                                {community?.description?.length ?? 0}/150
                            </span>
                        </div>
                    </div>

                    {/* URL */}
                    <div className="flex items-end gap-2">
                        <div className="flex-1 min-w-0">
                            <label className="text-sm font-medium text-grey-900 block mb-1">
                                URL
                            </label>
                            <Input
                                value={`${process.env.NEXT_PUBLIC_APP_URL}/${community?.slug}`}
                                readOnly
                                className="rounded-lg bg-grey-200"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            className="rounded-lg shrink-0 text-sm"
                            onClick={goToUrlTab}
                        >
                            Change URL
                        </Button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setInnerTab("questions")}
                            className="rounded-lg text-sm py-5 flex items-center justify-between gap-2 flex-1 min-w-[200px] border-grey-300"
                        >
                            Add membership questions
                            <ArrowRight className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setInnerTab("links")}
                            className="rounded-lg text-sm py-5 flex items-center justify-between gap-2 flex-1 min-w-[200px] border-grey-300"
                        >
                            Add links to your info box
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>

                    <Separator className="w-full opacity-50" />

                    <div className="flex gap-3 ">
                        <div
                            onClick={() => setCommunity({ ...community, is_public: !community?.is_public })}
                            className={cn("cursor-pointer flex flex-col gap-1 w-1/2 border p-4 rounded-xl hover:border-orange-500 transition-all duration-300", !community?.is_public ? "border-2 border-orange-500 bg-orange-50" : "")}>
                            <p className="text-base font-semibold text-grey-900">Private</p>
                            <p className="text-sm font-medium text-grey-900">Only members can see who's in the community and what they share. Content is hidden from search engine.</p>
                        </div>
                        <div
                            onClick={() => setCommunity({ ...community, is_public: true })}
                            className={cn("cursor-pointer flex flex-col gap-1 w-1/2 border p-4 rounded-xl hover:border-orange-500 transition-all duration-300", community?.is_public ? "border-2 border-orange-500 bg-orange-50" : "")}>
                            <p className="text-base font-semibold text-grey-900">Public</p>
                            <p className="text-sm font-medium text-grey-900">Anyone can see the community and what they post. Content is discoverable by search engines.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-grey-900 block">Support Email</span>
                        <span className="text-sm text-grey-600 block">{community?.support_email ?? "No support email set"}</span>
                        <button
                            type="button"
                            onClick={openSupportEmailModal}
                            className="shrink-0 rounded p-0.5 hover:bg-grey-100"
                            aria-label="Edit support email"
                        >
                            <EditIcon className="size-4 stroke-orange-500 cursor-pointer" />
                        </button>
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

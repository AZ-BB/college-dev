"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { getCommunityBySlug } from "@/action/communities"
import type { Community } from "@/action/communities"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { DetailsTab } from "./details-tab"
import { InviteTab } from "./invite-tab"
import { PricingTab } from "./pricing-tab"
import { TopicsTab } from "./topics-tab"
import { RulesTab } from "./rules-tab"
import { DiscoveryTab } from "./discovery-tab"
import SecondaryTabs from "@/components/secondery-tabs"

const TABS = [
  { id: "details", label: "Details" },
  { id: "invite", label: "Invite" },
  { id: "pricing", label: "Pricing" },
  { id: "topics", label: "Topics" },
  { id: "rules", label: "Rules" },
  { id: "discovery", label: "Discovery" },
] as const

type TabId = (typeof TABS)[number]["id"]

interface CommunitySettingsModalProps {
  /** Community slug (e.g. from route params). Component fetches everything else. */
  slug: string
  /** When false, renders as a full-page layout (no overlay). When true, renders inside a Dialog. */
  asModal?: boolean
  /** Only used when asModal is true. */
  open?: boolean
}

const TAB_IDS = TABS.map((t) => t.id)

function getTabFromParam(param: string | null): TabId {
  return param && TAB_IDS.includes(param as TabId) ? (param as TabId) : "details"
}

export function CommunitySettingsModal({
  slug,
  asModal = false,
  open = true
}: CommunitySettingsModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    getTabFromParam(searchParams.get("tab"))
  )

  useEffect(() => {
    const tab = getTabFromParam(searchParams.get("tab"))
    setActiveTab(tab)
  }, [searchParams])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    getCommunityBySlug(slug)
      .then((res) => {
        if (res.error || !res.data) {
          setError(res.message ?? res.error ?? "Failed to load community")
          setCommunity(null)
        } else {
          setCommunity(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  function handleTabChange(tabId: TabId) {
    setActiveTab(tabId)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const effectiveTab = TABS.some((t) => t.id === activeTab) ? activeTab : TABS[0].id

  const content = (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className={cn("flex shrink-0 items-start px-6 pt-6 pb-4 pr-12 border-b border-grey-200", community && "gap-3")}>
        {loading && (
          <Skeleton className="size-12 shrink-0 rounded-[14px]" />
        )}
        {!loading && community && (
          <>
            {community.avatar ? (
              <Image
                src={community.avatar}
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-[14px] object-cover"
              />
            ) : (
              <div className="size-12 shrink-0 rounded-[14px] bg-grey-200 flex items-center justify-center text-grey-600 font-semibold text-lg">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
          </>
        )}
        <div className="flex-1 min-w-0">
          {loading ? (
            <Skeleton className="h-5 w-32 mb-1" />
          ) : (
            <h2 className="text-base font-bold text-grey-900">
              {community?.name ?? "Community"}
            </h2>
          )}
          <p className="text-sm text-grey-700">Community Settings</p>
        </div>
      </div>

      {/* Tabs sidebar + content */}
      <div className="flex min-h-0 flex-1 overflow-hidden sm:flex-row flex-col">
        <nav className="w-48 shrink-0 border-r border-grey-200 bg-grey-50/50 py-3 px-4 space-y-2 hidden sm:block">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors rounded-lg",
                effectiveTab === tab.id
                  ? "bg-orange-500 text-white"
                  : "text-grey-600 hover:text-grey-900 hover:bg-grey-100/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Mobile: Horizontal tabs */}
        <nav className="w-full sm:hidden overflow-x-auto pb-2 px-4 py-2">
          <SecondaryTabs
            tabs={TABS.map((tab) => ({
              label: tab.label,
              value: tab.id,
            }))}
            value={activeTab}
            onTabChange={(value) => handleTabChange(value as TabId)}
          />
        </nav>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-auto p-6 bg-white">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!error && loading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          {!error && !loading && community && (
            <>
              {effectiveTab === "details" && (
                <DetailsTab slug={slug} />
              )}
              {effectiveTab === "invite" && community && (
                <InviteTab communityId={community.id} slug={slug} />
              )}
              {effectiveTab === "pricing" && (
                <PricingTab slug={slug} />
              )}
              {effectiveTab === "topics" && (
                <TopicsTab communityId={community.id} slug={slug} />
              )}
              {effectiveTab === "rules" && (
                <RulesTab communityId={community.id} slug={slug} />
              )}
              {effectiveTab === "discovery" && (
                <DiscoveryTab />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  if (asModal) {
    return (
      <Dialog open={true} onOpenChange={(open) => {
        if (!open) {
          router.push(`/communities/${slug}`)
        }
      }}>
        <DialogContent
          className="max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-screen max-sm:h-screen max-sm:max-w-none max-sm:rounded-none max-sm:border-0 sm:w-[65vw] sm:max-w-[65vw] sm:h-[70vh] sm:max-h-[70vh] sm:rounded-lg p-0 gap-0 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="w-full rounded-lg border border-grey-200 bg-white overflow-hidden shadow-sm">
      {content}
    </div>
  )
}

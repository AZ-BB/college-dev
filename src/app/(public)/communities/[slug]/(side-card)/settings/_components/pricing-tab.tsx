"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCommunityBySlug, updateCommunityPricing } from "@/action/communities"
import type { Community } from "@/action/communities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CommunityBillingCycle } from "@/enums/enums"
import { cn } from "@/lib/utils"
import { HelpCircle } from "lucide-react"
import { toast } from "sonner"

type BillingCycleValue = "MONTHLY" | "YEARLY" | "MONTHLY_YEARLY" | "ONE_TIME" | null

const BILLING_OPTIONS: { value: string; label: string }[] = [
  { value: CommunityBillingCycle.ONE_TIME, label: "One-time" },
  { value: CommunityBillingCycle.MONTHLY, label: "Monthly" },
  { value: CommunityBillingCycle.YEARLY, label: "Yearly" },
  { value: CommunityBillingCycle.MONTHLY_YEARLY, label: "Monthly + Yearly" },
]

interface PricingTabProps {
  slug: string
}

function parseAmount(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  return Number.isFinite(num) && num >= 0 ? num : null
}

export function PricingTab({ slug }: PricingTabProps) {
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFree, setIsFree] = useState(true)
  const [billingCycle, setBillingCycle] = useState<BillingCycleValue>(null)
  const [amountOneTime, setAmountOneTime] = useState<string>("")
  const [amountPerMonth, setAmountPerMonth] = useState<string>("")
  const [amountPerYear, setAmountPerYear] = useState<string>("")
  const [freeTrial, setFreeTrial] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

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
          const c = res.data
          setCommunity(c)
          setIsFree(c.is_free ?? true)
          setBillingCycle((c.billing_cycle as BillingCycleValue) ?? null)
          setAmountOneTime(c.amount_one_time != null ? String(c.amount_one_time) : "")
          setAmountPerMonth(c.amount_per_month != null ? String(c.amount_per_month) : "")
          setAmountPerYear(c.amount_per_year != null ? String(c.amount_per_year) : "")
          setFreeTrial(c.free_trial ?? false)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  const initialIsFree = community?.is_free ?? true
  const initialBillingCycle = (community?.billing_cycle as BillingCycleValue) ?? null
  const initialAmountOneTime = community?.amount_one_time != null ? String(community.amount_one_time) : ""
  const initialAmountPerMonth = community?.amount_per_month != null ? String(community.amount_per_month) : ""
  const initialAmountPerYear = community?.amount_per_year != null ? String(community.amount_per_year) : ""
  const initialFreeTrial = community?.free_trial ?? false

  const hasChanges =
    isFree !== initialIsFree ||
    billingCycle !== initialBillingCycle ||
    amountOneTime !== initialAmountOneTime ||
    amountPerMonth !== initialAmountPerMonth ||
    amountPerYear !== initialAmountPerYear ||
    freeTrial !== initialFreeTrial

  const monthlyNum = parseAmount(amountPerMonth)
  const yearlyNum = parseAmount(amountPerYear)
  const yearlyEquivalent = monthlyNum != null ? monthlyNum * 12 : 0
  const discountPercentage =
    monthlyNum != null &&
    monthlyNum > 0 &&
    yearlyNum != null &&
    yearlyNum < yearlyEquivalent
      ? Math.round(((yearlyEquivalent - yearlyNum) / yearlyEquivalent) * 100)
      : null

  function validate(): string | null {
    if (isFree) return null
    if (!billingCycle) return "Please select a billing period"
    if (billingCycle === CommunityBillingCycle.ONE_TIME) {
      const amt = parseAmount(amountOneTime)
      if (amt == null || amt <= 0) return "Please enter a valid one-time amount"
    }
    if (billingCycle === CommunityBillingCycle.MONTHLY) {
      const amt = parseAmount(amountPerMonth)
      if (amt == null || amt <= 0) return "Please enter a valid monthly amount"
    }
    if (billingCycle === CommunityBillingCycle.YEARLY) {
      const amt = parseAmount(amountPerYear)
      if (amt == null || amt <= 0) return "Please enter a valid yearly amount"
    }
    if (billingCycle === CommunityBillingCycle.MONTHLY_YEARLY) {
      const month = parseAmount(amountPerMonth)
      const year = parseAmount(amountPerYear)
      if (month == null || month <= 0 || year == null || year <= 0) {
        return "Please enter valid monthly and yearly amounts"
      }
    }
    return null
  }

  async function handleSave() {
    const validationError = validate()
    if (validationError) {
      toast.error(validationError)
      return
    }
    if (!community || !hasChanges) return

    setIsSaving(true)
    const res = await updateCommunityPricing({
      id: community.id,
      is_free: isFree,
      billing_cycle: isFree ? null : billingCycle,
      amount_per_month: isFree ? null : parseAmount(amountPerMonth),
      amount_per_year: isFree ? null : parseAmount(amountPerYear),
      amount_one_time: isFree ? null : parseAmount(amountOneTime),
      free_trial: isFree ? false : freeTrial,
    })
    setIsSaving(false)

    if (res.error) {
      toast.error(res.message ?? res.error)
      return
    }
    toast.success("Pricing updated successfully")
    router.refresh()
    if (res.data) {
      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              is_free: res.data!.is_free,
              billing_cycle: res.data!.billing_cycle,
              amount_per_month: res.data!.amount_per_month,
              amount_per_year: res.data!.amount_per_year,
              amount_one_time: res.data!.amount_one_time,
              free_trial: res.data!.free_trial,
            }
          : null
      )
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="flex gap-2">
          <Skeleton className="h-24 flex-1 rounded-lg" />
          <Skeleton className="h-24 flex-1 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-lg font-bold text-grey-900">Pricing Model</p>
        <p className="text-sm text-grey-600">Choose how members can join and access this community</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsFree(false)}
          className={cn(
            "p-4 border rounded-lg w-1/2 text-left transition-colors",
            !isFree
              ? "border-orange-500 bg-orange-50"
              : "border-grey-300 bg-grey-200 hover:bg-grey-100"
          )}
        >
          <p className="text-base font-bold text-grey-900">Earning Community</p>
          <p className="text-sm text-grey-600">
            You can add one-time payment, monthly, yearly, or both options, and members will select one.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setIsFree(true)}
          className={cn(
            "p-4 border rounded-lg w-1/2 text-left transition-colors",
            isFree
              ? "border-orange-500 bg-orange-50"
              : "border-grey-300 bg-grey-200 hover:bg-grey-100"
          )}
        >
          <p className="text-base font-bold text-grey-900">Free Community</p>
          <p className="text-sm text-grey-600">Members can join for free and access all features.</p>
        </button>
      </div>

      {!isFree && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-base font-bold text-grey-900 mb-2">Billing Period</p>
            <Select
              value={billingCycle ?? ""}
              onValueChange={(v) => setBillingCycle(v ? (v as BillingCycleValue) : null)}
            >
              <SelectTrigger className="w-full max-w-xs rounded-lg py-5" variant="outline">
                <SelectValue placeholder="Select billing period" />
              </SelectTrigger>
              <SelectContent>
                {BILLING_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {billingCycle === CommunityBillingCycle.ONE_TIME && (
            <div>
              <p className="text-sm font-medium text-grey-900 mb-1">Enter Amount (one-time)</p>
              <div className="flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2">
                <span className="text-grey-600">₹</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={amountOneTime}
                  onChange={(e) => setAmountOneTime(e.target.value)}
                  className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          )}

          {billingCycle === CommunityBillingCycle.MONTHLY && (
            <div>
              <p className="text-sm font-medium text-grey-900 mb-1">Enter Amount/month</p>
              <div className="flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2">
                <span className="text-grey-600">₹</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={amountPerMonth}
                  onChange={(e) => setAmountPerMonth(e.target.value)}
                  className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          )}

          {billingCycle === CommunityBillingCycle.YEARLY && (
            <div>
              <p className="text-sm font-medium text-grey-900 mb-1">Enter Amount/year</p>
              <div className="flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2">
                <span className="text-grey-600">₹</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={amountPerYear}
                  onChange={(e) => setAmountPerYear(e.target.value)}
                  className="border-0 bg-transparent shadow-none p-0 focus-visible:ring-0"
                />
              </div>
            </div>
          )}

          {billingCycle === CommunityBillingCycle.MONTHLY_YEARLY && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-grey-900 mb-1">Enter Amount/month</p>
                <div className="flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2">
                  <span className="text-grey-600">₹</span>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={amountPerMonth}
                    onChange={(e) => setAmountPerMonth(e.target.value)}
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-grey-900 mb-1">Enter Amount/Year</p>
                <div className="flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2">
                  <span className="text-grey-600">₹</span>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={amountPerYear}
                    onChange={(e) => setAmountPerYear(e.target.value)}
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                {discountPercentage != null && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-sm font-medium text-green-600">{discountPercentage}% discount</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-grey-500 hover:text-grey-700"
                          aria-label="Discount tip"
                        >
                          <HelpCircle className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p>Tip: Customers expect a 20% - 30% discount when paying annually.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
                {monthlyNum != null &&
                  monthlyNum > 0 &&
                  yearlyNum != null &&
                  discountPercentage == null &&
                  yearlyNum >= yearlyEquivalent && (
                  <div className="mt-2 flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-grey-500 hover:text-grey-700 flex items-center gap-1"
                          aria-label="Discount tip"
                        >
                          <HelpCircle className="size-4" />
                          <span className="text-sm text-grey-600">Tip</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p>Tip: Customers expect a 20% - 30% discount when paying annually.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-grey-900">Enable 7 day free trial</p>
            <Switch checked={freeTrial} onCheckedChange={setFreeTrial} />
          </div>
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
        className="bg-orange-500 hover:bg-orange-600 text-white rounded-md w-fit"
      >
        {isSaving ? "Saving…" : "Save"}
      </Button>
    </div>
  )
}

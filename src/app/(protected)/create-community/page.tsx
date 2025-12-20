"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createCommunity } from "@/action/communities"
import { getUserData } from "@/utils/get-user-data"
import { CheckCircle2 } from "lucide-react"

type PlanType = "free" | "paid"
type AudienceSize = "under_10k" | "10k_to_100k" | "100k_to_1m" | "over_1m"

interface CommunityFormData {
  plan: PlanType | null
  name: string
  audienceSize: AudienceSize | null
}

export default function CreateCommunityPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CommunityFormData>({
    plan: null,
    name: "",
    audienceSize: null,
  })

  const handlePlanSelect = (plan: PlanType) => {
    setFormData({ ...formData, plan })
    setStep(2)
  }

  const handleNameSubmit = () => {
    if (formData.name.trim()) {
      setStep(3)
    }
  }

  const handleAudienceSizeSelect = async (audienceSize: AudienceSize) => {
    setFormData({ ...formData, audienceSize })
    setIsLoading(true)

    try {
      // Get current user
      const userData = await getUserData()
      if (!userData) {
        throw new Error("User not authenticated")
      }

      // Create slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      // Create the community
      const result = await createCommunity(userData.id, {
        name: formData.name,
        slug,
        is_free: formData.plan === "free",
        audience_size: audienceSize,
        is_public: true,
      })

      if (result.success && result.data) {
        // Redirect to the community page
        router.push(`/communities/${result.data.id}`)
      } else {
        throw new Error(result.error || "Failed to create community")
      }
    } catch (error) {
      console.error("Error creating community:", error)
      alert("Failed to create community. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1 w-6 h-6">
                <div className="bg-black rounded-sm"></div>
                <div className="bg-black rounded-sm"></div>
                <div className="bg-black rounded-sm"></div>
                <div className="bg-black rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Choose Plan */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-sm font-medium rounded-full mb-2">
                Monetize
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Build a community that
                <br />
                pays you every month
              </h1>
              <p className="text-gray-600 text-lg">
                Turn your knowledge into recurring income with members who
                actually stay and succeed
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12">
              {/* Free Community */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-orange-500 font-medium mb-2">
                    Free Community
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    Always Free
                  </h2>
                </div>
                <Button
                  onClick={() => handlePlanSelect("free")}
                  variant="outline"
                  className="w-full h-12 text-base font-medium"
                >
                  Create Free Community
                </Button>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>Create up to 10 free communities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>All Features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>Unlimited courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>Unlimited members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>Custom URL</span>
                  </li>
                </ul>
              </div>

              {/* Paid Community */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-orange-500 font-medium mb-2">
                    Paid Community
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    3% Fee{" "}
                    <span className="text-base font-normal text-gray-600">
                      Per Paying Member
                    </span>
                  </h2>
                </div>
                <Button
                  onClick={() => handlePlanSelect("paid")}
                  className="w-full h-12 text-base font-medium bg-orange-500 hover:bg-orange-600"
                >
                  Start For Free
                </Button>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>Create up to 10 paid communities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>All Features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>Unlimited Courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>Unlimited members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>3% platform fee + payment gateway Charges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <span>Custom URL</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Name */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Create Your Community
              </h1>
            </div>

            <div className="space-y-4 mt-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Name
                </label>
                <Input
                  type="text"
                  placeholder="Community Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  maxLength={30}
                  className="h-12 text-base"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2 text-right">
                  {formData.name.length}/30
                </p>
              </div>
              <p className="text-sm text-gray-600">You can change this later</p>
              <Button
                onClick={handleNameSubmit}
                disabled={!formData.name.trim()}
                className="w-full h-12 text-base font-medium bg-orange-500 hover:bg-orange-600"
              >
                Save & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Audience Size */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Audience Size
              </h1>
              <p className="text-gray-600 text-lg">
                How many followers do you have on your main social media
                profile?
              </p>
            </div>

            <div className="space-y-3 mt-8">
              {[
                { value: "under_10k", label: "Under 10 K" },
                { value: "10k_to_100k", label: "10K to 100K" },
                { value: "100k_to_1m", label: "100K to 1m" },
                { value: "over_1m", label: "Over 1m" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    handleAudienceSizeSelect(option.value as AudienceSize)
                  }
                  disabled={isLoading}
                  className="w-full h-14 px-6 rounded-lg border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all text-left font-medium text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <span className="w-5 h-5 rounded-full border-2 border-gray-400 mr-3"></span>
                  {option.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() =>
                handleAudienceSizeSelect(formData.audienceSize || "under_10k")
              }
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-orange-500 hover:bg-orange-600 mt-6"
            >
              {isLoading ? "Creating Community..." : "Launch My Community"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}


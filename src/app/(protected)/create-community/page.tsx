"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Check from "@/components/icons/check"
import { AudienceSize } from "@/enums/enums"
import { createCommunity } from "@/action/communities"

type PlanType = "free" | "paid"

interface CommunityFormData {
  plan: PlanType | null
  name: string
  audienceSize: AudienceSize | null
}

export default function CreateCommunityPage() {
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

  const handleAudienceSizeSelect = (audienceSize: AudienceSize) => {
    setFormData({ ...formData, audienceSize })
  }

  const handleCreateCommunity = async () => {
    if (!formData.audienceSize || !formData.name.trim()) return

    setIsLoading(true)

    try {
      const result = await createCommunity({
        name: formData.name.trim(),
        audience_size: formData.audienceSize,
      })

      // If there's an error, handle it
      if (result.error) {
        throw new Error(result.message || "Failed to create community")
      }

      // If successful, the server action will redirect automatically
      // Next.js handles redirect() errors internally, so we won't reach here on success
    } catch (error) {
      // Ignore redirect errors (Next.js handles them automatically)
      if (error && typeof error === 'object' && 'digest' in error && String(error.digest).startsWith('NEXT_REDIRECT')) {
        return
      }
      
      console.error("Error creating community:", error)
      alert(error instanceof Error ? error.message : "Failed to create community. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="pb-20 pt-10 bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Step 1: Choose Plan */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-block px-3 py-1 bg-[#FEF0E7] text-orange-primary text-sm font-medium rounded-full mb-2">
                Monetize
              </div>
              <h1 className="text-4xl font-bold text-grey-900">
                Build a community that
                <br />
                pays you every month
              </h1>
              <p className="text-grey-600 text-sm">
                Turn your knowledge into recurring income with members who
                actually stay and succeed
              </p>
            </div>

            <div className="flex flex-col lg:flex-row justify-center gap-20 mt-12">
              {/* Free Community */}
              <div className="space-y-4 w-[70%] flex flex-col items-start">
                <div className="text-left">
                  <p className="text-sm text-orange-primary font-semibold mb-2">
                    Free Community
                  </p>
                  <h2 className="text-3xl font-bold text-icon-black mb-1">
                    Always Free
                  </h2>
                </div>
                <Button
                  onClick={() => handlePlanSelect("free")}
                  className="w-full bg-[#F4F4F6] hover:bg-[#e5e5e8] cursor-pointer text-black h-12 text-base font-semibold"
                >
                  Create Free Community
                </Button>
                <ul className="space-y-3 mt-6 text-sm text-grey-700">
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>Create up to 10 free communities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>All Features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>Unlimited courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>Unlimited members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>Custom URL</span>
                  </li>
                </ul>
              </div>

              {/* Paid Community */}
              <div className="space-y-4  flex flex-col items-start w-[70%]">
                <div className="text-left">
                  <p className="text-sm text-orange-primary font-semibold mb-2">
                    Paid Community
                  </p>
                  <h2 className="text-3xl font-bold text-icon-black mb-1">
                    3% Fee{" "}
                    <span className="text-base font-normal text-grey-600">
                      Per Paying Member
                    </span>
                  </h2>
                </div>
                <Button
                  onClick={() => handlePlanSelect("paid")}
                  className="w-full bg-orange-primary hover:bg-orange-primary/90 cursor-pointer text-white h-12 text-base font-semibold"
                >
                  Start For Free
                </Button>
                <ul className="space-y-3 mt-6 text-sm text-grey-700">
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>Create up to 10 paid communities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>All Features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>Unlimited Courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>Unlimited members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>3% platform fee + payment gateway Charges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check />
                    <span>Custom URL</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Name */}
        {step === 2 && (
          <div className="space-y-8 flex flex-col items-center w-full h-full">
            <div className="text-center space-y-4 ">
              <div className="flex justify-center mb-6">
                <div className="w-[44px] h-[44px] rounded-[1px] bg-[#FEF0E7] flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.0003 14.0002C17.222 14.0002 19.8337 11.3885 19.8337 8.16683C19.8337 4.94517 17.222 2.3335 14.0003 2.3335C10.7787 2.3335 8.16699 4.94517 8.16699 8.16683C8.16699 11.3885 10.7787 14.0002 14.0003 14.0002Z"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.97852 25.6667C3.97852 21.1517 8.47018 17.5 14.0002 17.5C15.1202 17.5 16.2052 17.6517 17.2202 17.9317"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M25.6663 21.0002C25.6663 21.3735 25.6197 21.7352 25.5263 22.0852C25.4213 22.5518 25.2347 23.0068 24.9897 23.4035C24.1847 24.7568 22.703 25.6668 20.9997 25.6668C19.798 25.6668 18.713 25.2118 17.8963 24.4651C17.5463 24.1618 17.243 23.8002 17.0097 23.4035C16.578 22.7035 16.333 21.8752 16.333 21.0002C16.333 19.7402 16.8347 18.5852 17.6513 17.7452C18.503 16.8702 19.693 16.3335 20.9997 16.3335C22.3763 16.3335 23.6247 16.9285 24.4647 17.8852C25.2113 18.7135 25.6663 19.8102 25.6663 21.0002Z"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22.7384 20.9766H19.2617"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 19.2734V22.7618"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-[32px] font-bold text-icon-black">
                Create Your Community
              </h1>
            </div>

            <div className="space-y-4 mt-8 lg:w-1/2 w-full">
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Community Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Community Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={{
                    background: "#F4F4F6",
                  }}
                  required
                  className="h-12 w-full rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-grey-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-grey-600">
                    You can change this later
                  </p>
                  <p className="text-sm text-grey-500 mt-2 text-right">
                    {formData.name.length}/30
                  </p>
                </div>
              </div>

              <Button
                onClick={handleNameSubmit}
                disabled={!formData.name.trim()}
                className="w-full h-12 mt-6 text-base font-medium bg-orange-primary hover:bg-orange-primary/90 cursor-pointer text-white"
              >
                Save & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Audience Size */}
        {step === 3 && (
          <div className="space-y-8 flex flex-col items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-[44px] h-[44px] rounded-[1px] bg-[#FEF0E7] flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.9998 8.3535C20.9298 8.34183 20.8481 8.34183 20.7781 8.3535C19.1681 8.29517 17.8848 6.97683 17.8848 5.3435C17.8848 3.67516 19.2264 2.3335 20.8948 2.3335C22.5631 2.3335 23.9048 3.68683 23.9048 5.3435C23.8931 6.97683 22.6098 8.29517 20.9998 8.3535Z"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.7977 16.847C21.396 17.1154 23.1577 16.8353 24.3944 16.007C26.0394 14.9103 26.0394 13.1137 24.3944 12.017C23.146 11.1887 21.361 10.9087 19.7627 11.1887"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.96457 8.3535C7.03457 8.34183 7.11624 8.34183 7.18624 8.3535C8.79624 8.29517 10.0796 6.97683 10.0796 5.3435C10.0796 3.67516 8.73791 2.3335 7.06957 2.3335C5.40124 2.3335 4.05957 3.68683 4.05957 5.3435C4.07124 6.97683 5.35457 8.29517 6.96457 8.3535Z"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.16635 16.847C6.56802 17.1154 4.80635 16.8353 3.56969 16.007C1.92469 14.9103 1.92469 13.1137 3.56969 12.017C4.81802 11.1887 6.60302 10.9087 8.20135 11.1887"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.9998 17.0683C13.9298 17.0567 13.8481 17.0567 13.7781 17.0683C12.1681 17.01 10.8848 15.6917 10.8848 14.0583C10.8848 12.39 12.2264 11.0483 13.8948 11.0483C15.5631 11.0483 16.9048 12.4017 16.9048 14.0583C16.8931 15.6917 15.6098 17.0217 13.9998 17.0683Z"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6048 20.7434C8.95984 21.8401 8.95984 23.6367 10.6048 24.7334C12.4715 25.9817 15.5282 25.9817 17.3948 24.7334C19.0398 23.6367 19.0398 21.8401 17.3948 20.7434C15.5398 19.5068 12.4715 19.5068 10.6048 20.7434Z"
                      stroke="#F7670E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-[32px] font-bold text-icon-black">
                  Audience Size
                </h1>
                <p className="text-grey-primary text-sm">
                  How many followers do you have on your main <br /> social
                  media profile?
                </p>
              </div>
            </div>

            <div className="space-y-3 lg:w-1/3 w-full">
              {[
                { value: AudienceSize.UNDER_10K, label: "Under 10 K" },
                { value: AudienceSize._10K_TO_100K, label: "10K to 100K" },
                { value: AudienceSize._100K_TO_1M, label: "100K to 1m" },
                { value: AudienceSize.OVER_1M, label: "Over 1m" },
              ].map((option) => {
                const isSelected = formData.audienceSize === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleAudienceSizeSelect(option.value as AudienceSize)
                    }
                    disabled={isLoading}
                    className={`cursor-pointer border-2 w-full text-sm h-10 text-[#2B3034] bg-[#F4F4F6] px-3 rounded-lg hover:border-icon-black
                         hover:bg-icon-black/10 transition-all text-left font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${isSelected ? "border-icon-black " : ""
                      }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center border-2 mr-2 ${isSelected
                        ? "border-icon-black"
                        : "border-grey-400"
                        }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-icon-black"></span>}
                    </span>
                    {option.label}
                  </button>
                )
              })}
            </div>

            <Button
              onClick={handleCreateCommunity}
              disabled={isLoading || !formData.audienceSize}
              className="h-12 lg:w-1/3 w-full mt-0 text-base font-semibold bg-orange-primary hover:bg-orange-primary/90 cursor-pointer text-white"
            >
              {isLoading ? "Creating Community..." : "Launch My Community"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

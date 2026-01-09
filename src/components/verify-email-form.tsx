"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { resendOTP, verifyOTP, isProfileComplete } from "@/action/auth"
import { createSupabaseBrowserClient } from "@/utils/supabase-browser"

interface VerifyEmailFormProps extends React.ComponentProps<"form"> {
  email?: string
}

export function VerifyEmailForm({
  email = "",
  className,
  ...props
}: VerifyEmailFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""])

  useEffect(() => {
    // Supabase automatically handles rate limiting (60 seconds between sends)
    // Start with resend available on page load
    setCanResend(true)
    setTimeLeft(0)
  }, [])

  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otpCode]
    newOtp[index] = value.slice(-1)
    setOtpCode(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const otp = otpCode.join("")
    if (otp.length !== 6) {
      setError("Please enter all 6 digits")
      setIsLoading(false)
      return
    }

    try {
      const result = await verifyOTP(email, otp)
      
      if (result.error || !result.data) {
        setError(result.error || "Invalid OTP. Please try again.")
        setIsLoading(false)
        return
      }

      // OTP verified successfully, check if profile is complete
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const profileCheck = await isProfileComplete(user.id)
        if (profileCheck.data?.needsOnboarding) {
          router.push("/onboarding")
        } else {
          router.push("/")
          router.refresh()
        }
      } else {
        // No user found, default to onboarding
        router.push("/onboarding")
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.")
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await resendOTP(email)
      
      if (result.error) {
        // Supabase returns rate limit errors, show them to the user
        setError(result.error)
        setIsLoading(false)
        return
      }
      
      // OTP sent successfully, start 60-second countdown
      setTimeLeft(60)
      setCanResend(false)
    } catch (err) {
      setError("Failed to resend OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeEmail = () => {
    router.push("/signup")
  }

  return (
    <form
      className={cn("flex flex-col gap-6 w-full", className)}
      {...props}
      onSubmit={handleContinue}
    >
      <FieldGroup className="gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[32px] font-semibold text-grey-900 font-generalSans">
            Verify Your Email
          </h1>
          <p className="text-sm font-instrumentSans text-[#7c7c7c]">
            We sent it to {email || "your email"}
          </p>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="rounded-[16px] border border-[#fecaca] bg-[#fee2e2] p-4"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold text-[#991b1b] font-instrumentSans">
              Error
            </AlertTitle>
            <AlertDescription className="text-xs text-[#7f1d1d] font-instrumentSans">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2">
          {otpCode.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              style={{ background: "#F4F4F6" }}
              className="h-12 w-12 rounded-[12px] border border-[#F4F4F6] bg-[#F4F4F6] text-center text-lg font-semibold text-black font-instrumentSans focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40 outline-none transition"
            />
          ))}
        </div>

        {/* Verify Button */}
        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 rounded-[16px] font-instrumentSans cursor-pointer bg-[#FA995E] text-base font-semibold text-white shadow-none transition hover:bg-[#f6833e] focus-visible:ring-[#f89b63]/40"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </Field>

        {/* Resend Section */}
        <div className="flex flex-col gap-3">
          <div className="rounded-[16px] bg-[#f3f4f6] p-4 text-center">
            <p className="text-sm font-instrumentSans text-[#7c7c7c]">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="font-semibold text-[#f89b63] hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              ) : (
                `Resend OTP in ${timeLeft} sec`
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleChangeEmail}
            className="text-center text-sm font-semibold text-[#f89b63] hover:underline font-instrumentSans"
          >
            Change Email
          </button>
        </div>
      </FieldGroup>
    </form>
  )
}


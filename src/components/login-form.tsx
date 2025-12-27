"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createSupabaseBrowserClient } from "@/utils/supabase-browser"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import config from "@/../config"
import { OAuthButtons } from "@/components/oauth-buttons"
import { isProfileComplete } from "@/action/auth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailValue, setEmailValue] = useState("")
  const [passwordValue, setPasswordValue] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")?.toString() || ""
    const password = formData.get("password")?.toString() || ""

    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // Check if confirmation is disabled
        if (config.confirmation === 'none') {
          // No confirmation required, show all errors normally
          setError(error.message || "Invalid email or password")
        } else {
          // Only show error if it's not about email confirmation
          if (!error.message.includes("Email not confirmed")) {
            setError(error.message || "Invalid email or password")
          }
          // If email is not confirmed, silently redirect
          if (error.message.includes("Email not confirmed")) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
            return
          }
        }
      } else if (data?.user) {
        // Check if email confirmation is required
        if (config.confirmation === 'none') {
          // No confirmation required, check profile completion
          router.push("/")
          router.refresh()
        } else {
          // Check if email is confirmed (fallback check)
          if (!data.user.email_confirmed_at) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          } else {
            // Email is confirmed, check profile completion
            const profileCheck = await isProfileComplete(data.user.id)
            if (profileCheck.data?.needsOnboarding) {
              router.push("/onboarding")
            } else {
              router.push("/")
              router.refresh()
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6 w-full", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup className="gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[32px] font-semibold text-gray-900 font-generalSans">Log In</h1>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="rounded-[12px] border-[#ffd7d1] bg-[#fff3f0] text-[#d93025] font-instrumentSans"
          >
            <AlertCircle className="text-[#d93025]" />
            <AlertTitle className="text-sm font-semibold">Error</AlertTitle>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="email" className="text-sm font-instrumentSans font-medium text-gray-800">
            Email
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Your email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            required
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password" className="text-sm font-instrumentSans font-medium text-gray-800">
            Password
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Your password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            required
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
          />
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "h-12 rounded-[16px] font-instrumentSans cursor-pointer text-base font-semibold text-white shadow-none transition focus-visible:ring-[#f89b63]/40",
              emailValue.trim() && passwordValue.trim()
                ? "bg-[#F7670E] hover:bg-[#e45f0d]"
                : "bg-[#FA995E] hover:bg-[#f6833e]"
            )}
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </Button>
        </Field>
        {config.oauth_types.length > 0 && (
          <>
            <div className="flex items-center gap-3 text-xs font-medium text-[#bdbdbd]">
              <span className="h-px flex-1 bg-[#d9d9d9]" />
              <span>or</span>
              <span className="h-px flex-1 bg-[#d9d9d9]" />
            </div>
            <Field>
              <OAuthButtons type="signin" />
            </Field>
          </>
        )}
        <Field>
          <FieldDescription className="text-center text-sm text-gray-700">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-semibold text-[#f89b63]">
              {" "}Sign Up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

"use client";

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { registerUser } from "@/action/auth"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import config from "@/../config"
import { OAuthButtons } from "@/components/oauth-buttons"
import { isValidRedirect } from "@/lib/redirect"

interface SignupFormProps extends React.ComponentProps<"form"> {
    redirect?: string | null;
}

export function SignupForm({
    className,
    redirect,
    ...props
}: SignupFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailValue, setEmailValue] = useState("")
  const [passwordValue, setPasswordValue] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password")?.toString() || ""

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setSuccess(result.message || "Registration successful!")

        const safeRedirect = redirect && isValidRedirect(redirect) ? redirect : null

        if (config.confirmation === "none") {
          const onboardingUrl = safeRedirect
            ? `/onboarding?redirect=${encodeURIComponent(safeRedirect)}`
            : "/onboarding"
          setTimeout(() => {
            window.location.href = onboardingUrl
          }, 1500)
        } else {
          const email = formData.get("email")?.toString() || ""
          const redirectParam = safeRedirect ? `&redirect=${encodeURIComponent(safeRedirect)}` : ""
          setTimeout(() => {
            window.location.href = `/verify-email?email=${encodeURIComponent(email)}${redirectParam}`
          }, 1500)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
          <h1 className="text-[32px] font-semibold text-grey-900 font-generalSans">
            Let&apos;s Get You Started
          </h1>
          <p className="text-sm font-instrumentSans text-[#7c7c7c]">
            Start learning or build a community
          </p>
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

        {success && (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="email" className="text-sm font-instrumentSans font-medium text-grey-800">
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
            style={{ background: "#F4F4F6" }}
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-grey-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password" className="text-sm font-instrumentSans font-medium text-grey-800">
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
            style={{ background: "#F4F4F6" }}
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-grey-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
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
            {isLoading ? "Signing Up..." : "Sign Up"}
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
              <OAuthButtons type="signup" redirect={redirect} />
            </Field>
          </>
        )}
        <Field>
          <FieldDescription className="text-center text-sm text-[#3a3a3a]">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-[#f89b63]">
              Log In
            </a>
          </FieldDescription>
        </Field>
        <Field>
          <FieldDescription className="text-center text-xs text-[#5a5a5a]">
            By signing up, you accept our{" "}
            <a href="/terms" className="font-semibold text-[#f89b63]">
              terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-semibold text-[#f89b63]">
              privacy policy
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

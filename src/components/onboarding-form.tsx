"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { AlertCircle } from "lucide-react"
import { completeUserProfile } from "@/action/auth"
import { createSupabaseBrowserClient } from "@/utils/supabase-browser"

export function OnboardingForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const isFilled = firstName.trim().length > 0 && lastName.trim().length > 0

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file")
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB")
        return
      }

      setAvatarFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Get current user
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError("Not authenticated")
        setIsLoading(false)
        return
      }

      let avatarUrl: string | undefined = undefined

      // Upload avatar if selected using API route
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)

        const uploadResponse = await fetch('/api/upload-avatar', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          setError(errorData.error || 'Failed to upload avatar')
          setIsLoading(false)
          return
        }

        const uploadResult = await uploadResponse.json()
        avatarUrl = uploadResult.url
      }

      // Update user profile
      const result = await completeUserProfile(firstName, lastName, bio, avatarUrl)
      
      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Profile updated successfully, redirect to home
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred. Please try again.")
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
          <h1 className="text-[32px] font-semibold text-grey-900 font-generalSans">
            Tell Us About You
          </h1>
          <p className="text-sm font-instrumentSans text-[#7c7c7c]">
            Communities need personal identities.
            <br />
            Profiles build trust and connections.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-[16px] border border-[#fecaca] bg-[#fee2e2] p-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold text-[#991b1b] font-instrumentSans">
              Error
            </AlertTitle>
            <AlertDescription className="text-xs text-[#7f1d1d] font-instrumentSans">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-20 w-20">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile preview"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d1d5db]">
                <svg
                  className="h-10 w-10 text-[#6b7280]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            onClick={() => document.getElementById('avatar-upload')?.click()}
            className="text-sm font-semibold text-[#f89b63] hover:underline font-instrumentSans"
          >
            {avatarPreview ? "Change Profile Picture" : "Upload Profile Picture"}
          </button>
        </div>

        {/* First Name */}
        <Field>
          <FieldLabel htmlFor="firstName" className="text-sm font-instrumentSans font-medium text-grey-800">
            First Name
          </FieldLabel>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={{ background: "#F4F4F6" }}
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-grey-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
          />
        </Field>

        {/* Last Name */}
        <Field>
          <FieldLabel htmlFor="lastName" className="text-sm font-instrumentSans font-medium text-grey-800">
            Last Name
          </FieldLabel>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={{ background: "#F4F4F6" }}
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-grey-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
          />
        </Field>

        {/* Bio */}
        <Field>
          <FieldLabel htmlFor="bio" className="text-sm font-instrumentSans font-medium text-grey-800">
            Bio
          </FieldLabel>
          <div className="relative">
            <textarea
              id="bio"
              name="bio"
              placeholder="Tell us a little about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              style={{ background: "#F4F4F6" }}
              className="h-24 w-full rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] px-3 py-2 text-base placeholder:text-grey-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40 resize-none"
            />
            <div className="absolute bottom-2 right-3 text-xs font-instrumentSans text-[#9ca3af]">
              {bio.length}/150
            </div>
          </div>
        </Field>

        {/* Submit Button */}
        <Field>
          <Button
            type="submit"
            disabled={isLoading || !isFilled}
            className={cn(
              "h-12 rounded-[16px] font-instrumentSans cursor-pointer text-base font-semibold text-white shadow-none transition focus-visible:ring-[#f89b63]/40",
              isFilled
                ? "bg-[#F7670E] hover:bg-[#e55a00]"
                : "bg-[#FA995E] hover:bg-[#FA995E] cursor-not-allowed opacity-75"
            )}
          >
            {isLoading ? "Getting Started..." : "Get Started"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}


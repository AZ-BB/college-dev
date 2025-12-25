"use client"

import { useState, useEffect } from "react"
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
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { updateUserProfile } from "@/action/profile"
import { uploadAvatar } from "@/action/auth"
import { createSupabaseBrowserClient } from "@/utils/supabase-browser"
import { Tables } from "@/database.types"

interface SettingsFormProps {
  user: Tables<"users">
  className?: string
}

export function SettingsForm({ user, className }: SettingsFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [firstName, setFirstName] = useState(user.first_name || "")
  const [lastName, setLastName] = useState(user.last_name || "")
  const [username, setUsername] = useState(user.username || "")
  const [bio, setBio] = useState(user.bio || "")
  const [location, setLocation] = useState(user.location || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null)
  const [facebookUrl, setFacebookUrl] = useState(user.facebook_url || "")
  const [instagramUrl, setInstagramUrl] = useState(user.instagram_url || "")
  const [xUrl, setXUrl] = useState(user.x_url || "")
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedin_url || "")
  const [youtubeUrl, setYoutubeUrl] = useState(user.youtube_url || "")
  const [websiteUrl, setWebsiteUrl] = useState(user.website_url || "")

  // Update form when user prop changes
  useEffect(() => {
    setFirstName(user.first_name || "")
    setLastName(user.last_name || "")
    setUsername(user.username || "")
    setBio(user.bio || "")
    setLocation(user.location || "")
    setAvatarPreview(user.avatar_url || null)
    setFacebookUrl(user.facebook_url || "")
    setInstagramUrl(user.instagram_url || "")
    setXUrl(user.x_url || "")
    setLinkedinUrl(user.linkedin_url || "")
    setYoutubeUrl(user.youtube_url || "")
    setWebsiteUrl(user.website_url || "")
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file")
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
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
    setSuccess(null)
    setIsLoading(true)

    try {
      // Get current user
      const supabase = createSupabaseBrowserClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setError("Not authenticated")
        setIsLoading(false)
        return
      }

      let avatarUrl: string | undefined = undefined

      // Upload avatar if selected
      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile, authUser.id)
        
        if (uploadResult.error) {
          setError(uploadResult.error)
          setIsLoading(false)
          return
        }
        
        avatarUrl = uploadResult.data?.url
      }

      // Update user profile
      const result = await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        username: username,
        bio: bio || undefined,
        location: location || undefined,
        avatar_url: avatarUrl,
        facebook_url: facebookUrl || undefined,
        instagram_url: instagramUrl || undefined,
        x_url: xUrl || undefined,
        linkedin_url: linkedinUrl || undefined,
        youtube_url: youtubeUrl || undefined,
        website_url: websiteUrl || undefined,
      })
      
      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      setSuccess("Profile updated successfully!")
      setAvatarFile(null)
      
      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6 w-full mb-6", className)}
      onSubmit={handleSubmit}
    >
      <FieldGroup className="gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900 font-generalSans">
            Profile Settings
          </h1>
          <p className="text-sm font-instrumentSans text-[#7c7c7c]">
            Update your profile information and preferences.
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

        {success && (
          <Alert className="rounded-[16px] border border-[#86efac] bg-[#dcfce7] p-4">
            <CheckCircle2 className="h-4 w-4 text-[#166534]" />
            <AlertTitle className="text-sm font-semibold text-[#166534] font-instrumentSans">
              Success
            </AlertTitle>
            <AlertDescription className="text-xs text-[#15803d] font-instrumentSans">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Picture Upload */}
        <div className="flex flex-col items-start gap-3">
          <FieldLabel className="text-sm font-instrumentSans font-medium text-gray-800">
            Profile Picture
          </FieldLabel>
          <div className="flex items-center gap-4">
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
            <div className="flex flex-col gap-2">
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
                className="text-sm font-semibold text-[#f89b63] hover:underline font-instrumentSans text-left"
              >
                {avatarPreview ? "Change Profile Picture" : "Upload Profile Picture"}
              </button>
              <p className="text-xs text-[#9ca3af] font-instrumentSans">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* First Name */}
        <Field>
          <FieldLabel htmlFor="firstName" className="text-sm font-instrumentSans font-medium text-gray-800">
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
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
          />
        </Field>

        {/* Last Name */}
        <Field>
          <FieldLabel htmlFor="lastName" className="text-sm font-instrumentSans font-medium text-gray-800">
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
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
          />
        </Field>

        {/* Username */}
        <Field>
          <FieldLabel htmlFor="username" className="text-sm font-instrumentSans font-medium text-gray-800">
            Username
          </FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ background: "#F4F4F6" }}
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
          />
          <FieldDescription className="text-xs text-[#9ca3af] font-instrumentSans">
            Your username is used in your profile URL.
          </FieldDescription>
        </Field>

        {/* Bio */}
        <Field>
          <FieldLabel htmlFor="bio" className="text-sm font-instrumentSans font-medium text-gray-800">
            Bio
          </FieldLabel>
          <div className="relative">
            <textarea
              id="bio"
              name="bio"
              placeholder="Tell us a little about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              style={{ background: "#F4F4F6" }}
              className="h-24 w-full rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] px-3 py-2 text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40 resize-none"
            />
            <div className="absolute bottom-2 right-3 text-xs font-instrumentSans text-[#9ca3af]">
              {bio.length}/500
            </div>
          </div>
        </Field>

        {/* Location */}
        <Field>
          <FieldLabel htmlFor="location" className="text-sm font-instrumentSans font-medium text-gray-800">
            Location
          </FieldLabel>
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="New York, NY"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ background: "#F4F4F6" }}
            className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
          />
        </Field>

        {/* Social Links Section */}
        <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-gray-900 font-generalSans">
              Social Links
            </h2>
            <p className="text-sm font-instrumentSans text-[#7c7c7c]">
              Add your social media profiles to your profile.
            </p>
          </div>

          {/* Website */}
          <Field>
            <FieldLabel htmlFor="websiteUrl" className="text-sm font-instrumentSans font-medium text-gray-800">
              Website
            </FieldLabel>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              style={{ background: "#F4F4F6" }}
              className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
            />
          </Field>

          {/* Facebook */}
          <Field>
            <FieldLabel htmlFor="facebookUrl" className="text-sm font-instrumentSans font-medium text-gray-800">
              Facebook
            </FieldLabel>
            <Input
              id="facebookUrl"
              name="facebookUrl"
              type="url"
              placeholder="https://facebook.com/yourprofile"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              style={{ background: "#F4F4F6" }}
              className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
            />
          </Field>

          {/* Instagram */}
          <Field>
            <FieldLabel htmlFor="instagramUrl" className="text-sm font-instrumentSans font-medium text-gray-800">
              Instagram
            </FieldLabel>
            <Input
              id="instagramUrl"
              name="instagramUrl"
              type="url"
              placeholder="https://instagram.com/yourprofile"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              style={{ background: "#F4F4F6" }}
              className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
            />
          </Field>

          {/* Twitter/X */}
          <Field>
            <FieldLabel htmlFor="xUrl" className="text-sm font-instrumentSans font-medium text-gray-800">
              Twitter / X
            </FieldLabel>
            <Input
              id="xUrl"
              name="xUrl"
              type="url"
              placeholder="https://x.com/yourprofile"
              value={xUrl}
              onChange={(e) => setXUrl(e.target.value)}
              style={{ background: "#F4F4F6" }}
              className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
            />
          </Field>

          {/* LinkedIn */}
          <Field>
            <FieldLabel htmlFor="linkedinUrl" className="text-sm font-instrumentSans font-medium text-gray-800">
              LinkedIn
            </FieldLabel>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              style={{ background: "#F4F4F6" }}
              className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
            />
          </Field>

          {/* YouTube */}
          <Field>
            <FieldLabel htmlFor="youtubeUrl" className="text-sm font-instrumentSans font-medium text-gray-800">
              YouTube
            </FieldLabel>
            <Input
              id="youtubeUrl"
              name="youtubeUrl"
              type="url"
              placeholder="https://youtube.com/@yourchannel"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              style={{ background: "#F4F4F6" }}
              className="h-12 rounded-[16px] text-black font-instrumentSans border border-[#F4F4F6] bg-[#F4F4F6] text-base placeholder:text-gray-400 focus-visible:border-[#f89b63] focus-visible:ring-2 focus-visible:ring-[#f89b63]/40"
            />
          </Field>
        </div>

        {/* Submit Button */}
        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "h-12 rounded-[16px] font-instrumentSans cursor-pointer text-base font-semibold text-white shadow-none transition focus-visible:ring-[#f89b63]/40",
              isLoading
                ? "bg-[#FA995E] hover:bg-[#FA995E] cursor-not-allowed opacity-75"
                : "bg-[#F7670E] hover:bg-[#e55a00]"
            )}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}


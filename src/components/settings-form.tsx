"use client"

import { useState, useEffect, useRef } from "react"
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
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface SettingsFormProps {
  user: Tables<"users">
  contributionsCount?: number
  className?: string
}

export function SettingsForm({
  user,
  contributionsCount = 0,
  className,
}: SettingsFormProps) {
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar_url || null
  )
  const [facebookUrl, setFacebookUrl] = useState(user.facebook_url || "")
  const [instagramUrl, setInstagramUrl] = useState(user.instagram_url || "")
  const [xUrl, setXUrl] = useState(user.x_url || "")
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedin_url || "")
  const [youtubeUrl, setYoutubeUrl] = useState(user.youtube_url || "")
  const [websiteUrl, setWebsiteUrl] = useState(user.website_url || "")
  const [hideFromSearch, setHideFromSearch] = useState(false)

  // Change Name Modal state
  const [isChangeNameModalOpen, setIsChangeNameModalOpen] = useState(false)
  const [modalFirstName, setModalFirstName] = useState(user.first_name || "")
  const [modalLastName, setModalLastName] = useState(user.last_name || "")
  const [isChangingName, setIsChangingName] = useState(false)
  const [nameChangeError, setNameChangeError] = useState<string | null>(null)

  // Track initial values for change detection
  const initialValuesRef = useRef({
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    avatarUrl: user.avatar_url || null,
    facebookUrl: user.facebook_url || "",
    instagramUrl: user.instagram_url || "",
    xUrl: user.x_url || "",
    linkedinUrl: user.linkedin_url || "",
    youtubeUrl: user.youtube_url || "",
    websiteUrl: user.website_url || "",
    hideFromSearch: false,
  })

  // Check if form has changes (excluding first/last name as they're changed via modal)
  const hasChanges = () => {
    const initial = initialValuesRef.current
    // Check if avatar changed (either new file selected or preview changed from initial)
    const avatarChanged =
      avatarFile !== null ||
      (avatarPreview !== null && avatarPreview !== initial.avatarUrl) ||
      (avatarPreview === null && initial.avatarUrl !== null)

    return (
      username !== initial.username ||
      bio !== initial.bio ||
      location !== initial.location ||
      avatarChanged ||
      facebookUrl !== initial.facebookUrl ||
      instagramUrl !== initial.instagramUrl ||
      xUrl !== initial.xUrl ||
      linkedinUrl !== initial.linkedinUrl ||
      youtubeUrl !== initial.youtubeUrl ||
      websiteUrl !== initial.websiteUrl ||
      hideFromSearch !== initial.hideFromSearch
    )
  }

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update hasUnsavedChanges whenever form values change (excluding first/last name)
  useEffect(() => {
    setHasUnsavedChanges(hasChanges())
  }, [
    username,
    bio,
    location,
    avatarFile,
    avatarPreview,
    facebookUrl,
    instagramUrl,
    xUrl,
    linkedinUrl,
    youtubeUrl,
    websiteUrl,
    hideFromSearch,
  ])

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        // Modern browsers will show their own message
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // Handle internal navigation (Next.js App Router)
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link && link.href && !link.href.startsWith("#")) {
        // Check if it's an internal link (same origin)
        try {
          const linkUrl = new URL(link.href, window.location.origin)
          const currentUrl = new URL(window.location.href)

          // Only intercept if it's a different route
          if (
            linkUrl.origin === currentUrl.origin &&
            linkUrl.pathname !== currentUrl.pathname
          ) {
            const confirmed = window.confirm(
              "You have unsaved changes. Are you sure you want to leave?"
            )
            if (!confirmed) {
              e.preventDefault()
              e.stopPropagation()
              return false
            }
          }
        } catch {
          // Invalid URL, ignore
        }
      }
    }

    // Use capture phase to catch links early
    document.addEventListener("click", handleClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [hasUnsavedChanges])

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

    // Update modal form when user prop changes
    setModalFirstName(user.first_name || "")
    setModalLastName(user.last_name || "")

    // Update initial values ref
    initialValuesRef.current = {
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "",
      avatarUrl: user.avatar_url || null,
      facebookUrl: user.facebook_url || "",
      instagramUrl: user.instagram_url || "",
      xUrl: user.x_url || "",
      linkedinUrl: user.linkedin_url || "",
      youtubeUrl: user.youtube_url || "",
      websiteUrl: user.website_url || "",
      hideFromSearch: false,
    }
  }, [user])

  // Reset modal form when opening
  useEffect(() => {
    if (isChangeNameModalOpen) {
      setModalFirstName(user.first_name || "")
      setModalLastName(user.last_name || "")
      setNameChangeError(null)
    }
  }, [isChangeNameModalOpen, user])

  const handleChangeName = async () => {
    if (!modalFirstName.trim() || !modalLastName.trim()) {
      setNameChangeError("First name and last name are required")
      return
    }

    setIsChangingName(true)
    setNameChangeError(null)

    try {
      const result = await updateUserProfile({
        first_name: modalFirstName.trim(),
        last_name: modalLastName.trim(),
      })

      if (result.error) {
        setNameChangeError(result.error)
        setIsChangingName(false)
        return
      }

      // Update local state
      setFirstName(modalFirstName.trim())
      setLastName(modalLastName.trim())

      // Update initial values ref
      initialValuesRef.current.firstName = modalFirstName.trim()
      initialValuesRef.current.lastName = modalLastName.trim()
      setHasUnsavedChanges(hasChanges())

      // Close modal and refresh
      setIsChangeNameModalOpen(false)
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (err) {
      console.error(err)
      setNameChangeError("An unexpected error occurred. Please try again.")
    } finally {
      setIsChangingName(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
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
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

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

      // Update user profile (name is changed separately via modal)
      const result = await updateUserProfile({
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

      // Update avatar preview if a new avatar was uploaded
      if (avatarUrl) {
        setAvatarPreview(avatarUrl)
      }

      // Reset initial values to current values after successful save
      const newAvatarUrl = avatarUrl || user.avatar_url || null
      initialValuesRef.current = {
        firstName,
        lastName,
        username,
        bio,
        location,
        avatarUrl: newAvatarUrl,
        facebookUrl,
        instagramUrl,
        xUrl,
        linkedinUrl,
        youtubeUrl,
        websiteUrl,
        hideFromSearch,
      }
      setHasUnsavedChanges(false)

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

  const profileUrl = `TheCollege.com/${username}`
  const canChangeUrl = contributionsCount >= 90

  return (
    <form
      className={cn("flex flex-col gap-6 w-full ", className)}
      onSubmit={handleSubmit}
    >
      <h1 className="text-2xl font-semibold text-gray-900 font-generalSans">
        Details
      </h1>

      {error && (
        <Alert
          variant="destructive"
          className="rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold text-red-800">
            Error
          </AlertTitle>
          <AlertDescription className="text-xs text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-sm font-semibold text-green-800">
            Success
          </AlertTitle>
          <AlertDescription className="text-xs text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Photo */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile preview"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-200">
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => document.getElementById("avatar-upload")?.click()}
              className="text-sm font-bold text-orange-primary cursor-pointer hover:underline"
            >
              Change profile photo
            </button>
          </div>
        </div>
      </div>

      {/* Name Section */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row gap-4">
          {/* First Name */}
          <Field className="gap-1">
            <FieldLabel
              htmlFor="firstName"
              className="text-sm font-medium text-gray-900"
            >
              First Name
            </FieldLabel>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={firstName}
              readOnly
              className="h-11 rounded-lg text-black border border-gray-300 bg-gray-50 text-base placeholder:text-gray-400 cursor-not-allowed"
            />
          </Field>

          {/* Last Name */}
          <Field className="gap-1">
            <FieldLabel
              htmlFor="lastName"
              className="text-sm font-medium text-gray-900"
            >
              Last Name
            </FieldLabel>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={lastName}
              readOnly
              className="h-11 rounded-lg text-black border border-gray-300 bg-gray-50 text-base placeholder:text-gray-400 cursor-not-allowed"
            />
          </Field>
        </div>
        <div className="">
          <p className="text-sm text-gray-600">
            You can only change your name once, and you must use your real name.{" "}
            {!user.is_name_changed && (
              <button
                type="button"
                onClick={() => setIsChangeNameModalOpen(true)}
                className="text-blue-600 font-semibold cursor-pointer hover:underline"
              >
                Change name
              </button>
            )}
          </p>
        </div>
      </div>
      {/* URL */}
      <Field className="gap-1">
        <FieldLabel htmlFor="url" className="text-sm font-medium text-gray-900">
          URL
        </FieldLabel>
        <Input
          id="url"
          name="url"
          type="text"
          value={profileUrl}
          disabled={!canChangeUrl}
          readOnly
          className="h-11 rounded-lg text-black border border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary disabled:cursor-not-allowed"
        />
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            {canChangeUrl
              ? "You can change your URL."
              : `You can change your URL once you've got 90 contributions.`}
          </p>
        </div>
      </Field>

      {/* Bio */}
      <Field className="gap-1">
        <FieldLabel htmlFor="bio" className="text-sm font-medium text-gray-900">
          Bio
        </FieldLabel>
        <div className="relative">
          <textarea
            id="bio"
            name="bio"
            placeholder="Placeholder"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
            className="h-24 w-full rounded-lg bg-[#F4F4F6] text-black border border-gray-300 px-3 py-2 text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary resize-none"
          />
          <div className="absolute bottom-2 right-3 text-xs text-gray-500">
            {bio.length}/150
          </div>
        </div>
      </Field>

      {/* Location */}
      <Field className="gap-1">
        <FieldLabel
          htmlFor="location"
          className="text-sm font-medium text-gray-900"
        >
          Location
        </FieldLabel>
        <Input
          id="location"
          name="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-11 rounded-lg text-black border border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary"
        />
      </Field>

      {/* Social Links Section */}
      <div className="flex flex-col gap-4 pt-4 ">
        <h2 className="text-2xl font-bold text-icon-black">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <Field className="gap-1">
              <FieldLabel
                htmlFor="websiteUrl"
                className="text-sm font-medium text-icon-black"
              >
                Website
              </FieldLabel>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="h-11 rounded-lg text-black border border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary"
              />
            </Field>

            <Field className="gap-1">
              <FieldLabel
                htmlFor="xUrl"
                className="text-sm font-medium text-gray-900"
              >
                X
              </FieldLabel>
              <Input
                id="xUrl"
                name="xUrl"
                type="url"
                placeholder="https://x.com/yourprofile"
                value={xUrl}
                onChange={(e) => setXUrl(e.target.value)}
                className="h-11 rounded-lg text-black border border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary"
              />
            </Field>

            <Field className="gap-1">
              <FieldLabel
                htmlFor="linkedinUrl"
                className="text-sm font-medium text-gray-900"
              >
                LinkedIn
              </FieldLabel>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="h-11 rounded-lg text-black border border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary"
              />
            </Field>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            <Field className="gap-1">
              <FieldLabel
                htmlFor="instagramUrl"
                className="text-sm font-medium text-gray-900"
              >
                Instagram
              </FieldLabel>
              <Input
                id="instagramUrl"
                name="instagramUrl"
                type="url"
                placeholder="https://instagram.com/yourprofile"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="h-11 rounded-lg text-black border border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary"
              />
            </Field>

            <Field className="gap-1">
              <FieldLabel
                htmlFor="youtubeUrl"
                className="text-sm font-medium text-gray-900"
              >
                YouTube
              </FieldLabel>
              <Input
                id="youtubeUrl"
                name="youtubeUrl"
                type="url"
                placeholder="https://youtube.com/@yourchannel"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="h-11 rounded-lg text-black border border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary"
              />
            </Field>

            <Field className="gap-1">
              <FieldLabel
                htmlFor="facebookUrl"
                className="text-sm font-medium text-gray-900"
              >
                Facebook
              </FieldLabel>
              <Input
                id="facebookUrl"
                name="facebookUrl"
                type="url"
                placeholder="https://facebook.com/yourprofile"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="h-11 rounded-lg text-black border border-gray-300 text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Hide profile from search engines */}
      <div className="flex items-center justify-between pt-4 text-gray-primary border-gray-200">
        <label
          htmlFor="hideFromSearch"
          className="text-sm font-medium text-gray-900 cursor-pointer"
        >
          Hide profile from search engines
        </label>
        <Switch
          id="hideFromSearch"
          checked={hideFromSearch}
          onCheckedChange={setHideFromSearch}
        />
      </div>

      {/* Submit Button */}
      <div className="w-full flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isLoading || !hasUnsavedChanges}
          className={cn(
            "h-11 rounded-lg font-medium cursor-pointer text-base text-white shadow-none transition",
            isLoading || !hasUnsavedChanges
              ? "bg-orange-primary/70 hover:bg-orange-primary/70 cursor-not-allowed"
              : "bg-orange-primary hover:bg-orange-primary/90"
          )}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Change Name Modal */}
      <Dialog
        open={isChangeNameModalOpen}
        onOpenChange={setIsChangeNameModalOpen}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Change Name
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {nameChangeError && (
              <Alert
                variant="destructive"
                className="rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold text-red-800">
                  Error
                </AlertTitle>
                <AlertDescription className="text-xs text-red-700">
                  {nameChangeError}
                </AlertDescription>
              </Alert>
            )}

            <Field className="gap-1">
              <FieldLabel
                htmlFor="modalFirstName"
                className="text-sm font-medium text-gray-900"
              >
                First Name
              </FieldLabel>
              <Input
                id="modalFirstName"
                name="modalFirstName"
                type="text"
                placeholder="First Name"
                value={modalFirstName}
                onChange={(e) => setModalFirstName(e.target.value)}
                required
                disabled={isChangingName}
                className="h-11 rounded-lg text-black border border-gray-300 bg-white text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary"
              />
            </Field>

            <Field className="gap-1">
              <FieldLabel
                htmlFor="modalLastName"
                className="text-sm font-medium text-gray-900"
              >
                Last Name
              </FieldLabel>
              <Input
                id="modalLastName"
                name="modalLastName"
                type="text"
                placeholder="Last Name"
                value={modalLastName}
                onChange={(e) => setModalLastName(e.target.value)}
                required
                disabled={isChangingName}
                className="h-11 rounded-lg text-black border border-gray-300 bg-white text-base placeholder:text-gray-400 focus-visible:border-orange-primary focus-visible:ring-1 focus-visible:ring-orange-primary"
              />
            </Field>
          </div>

          <DialogFooter className="flex flex-col! gap-3 sm:justify-end">
            <Button
              type="button"
              onClick={handleChangeName}
              disabled={
                isChangingName ||
                !modalFirstName.trim() ||
                !modalLastName.trim()
              }
              className={cn(
                "h-11 rounded-lg font-medium text-base text-white shadow-none transition",
                isChangingName ||
                  !modalFirstName.trim() ||
                  !modalLastName.trim()
                  ? "bg-orange-primary/70 hover:bg-orange-primary/70 cursor-not-allowed"
                  : "bg-orange-primary hover:bg-orange-primary/90"
              )}
            >
              {isChangingName ? "Changing..." : "Change"}
            </Button>
            <Button
              type="button"
              onClick={() => setIsChangeNameModalOpen(false)}
              disabled={isChangingName}
              className="h-11 rounded-lg font-medium text-base text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}

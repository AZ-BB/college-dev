"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { updatePassword } from "@/action/auth"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface UpdatePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdatePasswordModal({ open, onOpenChange }: UpdatePasswordModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const result = await updatePassword(password)

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setSuccess(result.message || "Password updated successfully!")
        // Close modal after 2 seconds
        setTimeout(() => {
          onOpenChange(false)
          setSuccess(null)
          // Reset form
          e.currentTarget.reset()
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      // Reset form and errors when closing
      setError(null)
      setSuccess(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
            <DialogDescription>
              Enter your new password below. Make sure it's at least 8 characters long.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
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
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input id="password" name="password" type="password" required />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
                <Input id="confirm-password" name="confirm-password" type="password" required />
                <FieldDescription>Please confirm your new password.</FieldDescription>
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-primary text-white hover:bg-orange-primary/90">
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


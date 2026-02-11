"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface InviteMemberLinkModalProps {
  slug: string
  children?: React.ReactNode
}

export function InviteMemberLinkModal({
  slug,
  children,
}: InviteMemberLinkModalProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const communityLink = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${slug}`

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(communityLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Handle error silently or show a toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left">Invite Your Friends</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-grey-900">Share</label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={communityLink}
                className="flex-1 rounded-lg bg-grey-200 text-base"
              />
              <Button
                variant="secondary"
                onClick={handleCopyLink}
                className="rounded-lg shrink-0"
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import EditIcon from "@/components/icons/edit"
import { UpdatePasswordModal } from "./UpdatePasswordModal"

export function PasswordSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold">Password</span>
          <span className="text-base font-medium">Change your password</span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-200"
          type="button"
        >
          <EditIcon />
        </button>
      </div>

      <UpdatePasswordModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}


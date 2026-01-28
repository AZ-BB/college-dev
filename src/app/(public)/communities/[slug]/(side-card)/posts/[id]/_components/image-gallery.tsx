"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface Attachment {
    id: number
    url: string
    name: string
    type: string
}

interface ImageGalleryProps {
    attachments: Attachment[]
}

export default function ImageGallery({ attachments }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const imageAttachments = attachments.filter(attachment => attachment.type === "IMAGE")

    useEffect(() => {
        if (isOpen) {
            const overlay = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement
            if (overlay) {
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
            }
            
            // Style the close button to make it visible
            const closeButton = document.querySelector('[data-slot="dialog-close"]') as HTMLElement
            if (closeButton) {
                closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
                closeButton.style.color = 'black'
                closeButton.style.borderRadius = '50%'
                closeButton.style.padding = '8px'
                closeButton.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                closeButton.style.zIndex = '50'
                closeButton.style.opacity = '1'
                
                // Ensure SVG icon is visible
                const svg = closeButton.querySelector('svg')
                if (svg) {
                    svg.style.color = 'black'
                    svg.style.stroke = 'black'
                }
            }
        }
    }, [isOpen])

    if (imageAttachments.length === 0) {
        return null
    }

    const handleImageClick = (attachment: Attachment) => {
        setSelectedImage({ url: attachment.url, name: attachment.name })
        setIsOpen(true)
    }

    const handleClose = () => {
        setIsOpen(false)
        setSelectedImage(null)
    }

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {imageAttachments.map((attachment) => (
                    <button
                        key={attachment.id}
                        onClick={() => handleImageClick(attachment)}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        <Image 
                            src={attachment.url} 
                            alt={attachment.name} 
                            width={160} 
                            height={160} 
                            className="w-48 h-48 rounded-md object-cover" 
                        />
                    </button>
                ))}
            </div>

            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent 
                    fullScreen 
                    showCloseButton={true}
                    className="bg-transparent p-0 flex items-center justify-center [&>button[data-slot='dialog-close']]:bg-white/90 [&>button[data-slot='dialog-close']]:text-black [&>button[data-slot='dialog-close']]:hover:bg-white [&>button[data-slot='dialog-close']]:rounded-full [&>button[data-slot='dialog-close']]:p-2 [&>button[data-slot='dialog-close']]:shadow-lg [&>button[data-slot='dialog-close']]:z-50"
                    onInteractOutside={(e) => {
                        e.preventDefault()
                        handleClose()
                    }}
                    onEscapeKeyDown={handleClose}
                >
                    <div 
                        className="absolute inset-0 w-full h-full"
                        onClick={handleClose}
                    />
                    {selectedImage && (
                        <div 
                            className="relative w-full h-full flex items-center justify-center p-4 z-10"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <Image 
                                src={selectedImage.url} 
                                alt={selectedImage.name}
                                width={1920}
                                height={1080}
                                className="max-w-full max-h-full object-contain"
                                priority
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

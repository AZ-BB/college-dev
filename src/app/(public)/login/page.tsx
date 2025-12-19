import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white px-4 py-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md">
        <svg
          width="46"
          height="44"
          viewBox="0 0 46 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.10106 1.80457H38.9427C41.3155 1.80457 43.2391 3.75795 43.2391 6.16753V37.4416C43.2391 39.8512 41.3155 41.8046 38.9427 41.8046H6.10106C3.72826 41.8046 1.80469 39.8512 1.80469 37.4416V6.16753C1.80469 3.75795 3.72826 1.80457 6.10106 1.80457Z"
            stroke="black"
            stroke-width="3.60913"
            stroke-miterlimit="10"
          />
          <path
            d="M35.1919 29.9559C35.1919 32.6433 33.0716 34.8216 30.4558 34.8216C27.8446 34.8216 25.727 32.6507 25.7197 29.9698V25.0902H30.4558C33.0716 25.0902 35.1919 27.2685 35.1919 29.9559Z"
            stroke="black"
            stroke-width="3.60913"
            stroke-miterlimit="10"
          />
          <path
            d="M19.3247 25.0902V29.9697C19.3174 32.6507 17.1998 34.8216 14.5886 34.8216C11.9728 34.8216 9.85254 32.6432 9.85254 29.9559C9.85254 27.2733 11.9656 25.0977 14.5751 25.0902H19.3247Z"
            stroke="black"
            stroke-width="3.60913"
            stroke-miterlimit="10"
          />
          <path
            d="M35.1919 13.6537C35.1919 16.341 33.0716 18.5194 30.4558 18.5194H25.7197V13.6537C25.7197 10.9663 27.84 8.78796 30.4558 8.78796C33.0716 8.78796 35.1919 10.9663 35.1919 13.6537Z"
            stroke="black"
            stroke-width="3.60913"
            stroke-miterlimit="10"
          />
          <path
            d="M19.3247 13.6537V18.5194H14.5751C11.9656 18.5119 9.85254 16.3363 9.85254 13.6537C9.85254 10.9663 11.9728 8.78796 14.5886 8.78796C17.2044 8.78796 19.3247 10.9663 19.3247 13.6537Z"
            stroke="black"
            stroke-width="3.60913"
            stroke-miterlimit="10"
          />
          <path
            d="M25.7198 18.5194H19.3242V25.09H25.7198V18.5194Z"
            stroke="black"
            stroke-width="3.60913"
            stroke-miterlimit="10"
          />
        </svg>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <LoginForm className="w-full" />
        </div>
      </div>
    </div>
  )
}

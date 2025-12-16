'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function AuthCodeErrorPage() {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    if (countdown === 0) {
      router.push('/login')
      return
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, router])

  const handleRedirectNow = () => {
    router.push('/login')
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Authentication Error</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>
            We couldn't complete your authentication request. This could be due to an invalid or expired code.
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Redirecting to login page in <span className="font-bold text-foreground">{countdown}</span> second{countdown !== 1 ? 's' : ''}...
          </p>
          
          <Button onClick={handleRedirectNow} className="w-full">
            Go to Login Now
          </Button>
        </div>
      </div>
    </div>
  )
}


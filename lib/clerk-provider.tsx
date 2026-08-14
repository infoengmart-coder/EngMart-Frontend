'use client'

// Clerk is mounted only when a publishable key exists.
//
// ClerkProvider throws at render time if the key is missing, which would take
// the whole site down rather than just disabling one button. Wrapping it means
// a missing key costs the "Continue with Google" button and nothing else —
// email/password sign-in, the catalogue and checkout all keep working.
//
// Clerk here is only an OAuth broker: it runs the Google flow, and the session
// it produces is immediately traded for our own Django JWT (see
// components/google-sign-in.tsx). It is not the app's session.

import { ClerkProvider } from '@clerk/nextjs'

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''

export function OptionalClerkProvider({ children }: { children: React.ReactNode }) {
  if (!PUBLISHABLE_KEY) return <>{children}</>

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      // Clerk's own UI is never shown; these only stop it inventing routes
      // that do not exist here.
      signInUrl="/login"
      signUpUrl="/register"
    >
      {children}
    </ClerkProvider>
  )
}

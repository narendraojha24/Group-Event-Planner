import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { EventsProvider } from "@/hooks/use-events"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Group Event Planner",
  description: "Plan events together with your group",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EventsProvider>
          {children}
          <Toaster />
        </EventsProvider>
      </body>
    </html>
  )
}

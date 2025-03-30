import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { MainLayout } from "@/components/layout/main-layout"
import "@/app/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Task Management Dashboard",
    description: "Modern task management application",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <MainLayout>{children}</MainLayout>
        </ThemeProvider>
        </body>
        </html>
    )
}


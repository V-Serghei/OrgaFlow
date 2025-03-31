
import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { MainLayout } from "@/components/layout/main-layout"
import "@/app/globals.css"
import type { Metadata } from "next"
import { ClientWrapper } from "@/components/client-wrapper"
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
            <ClientWrapper>
                <MainLayout>{children}</MainLayout>
            </ClientWrapper>
        </ThemeProvider>
        </body>
        </html>
    )
}


"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
export function MainLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen flex-col">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex flex-1">
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-4 pt-16 md:p-6 md:pt-16">
                    <div className="mx-auto max-w-7xl">{children}</div>
                   
                </main>
            </div>
            <Footer />
        </div>
    )
}


// src/components/ui/use-toast-store.ts
"use client"

import * as React from "react"

export type Toast = {
    id: string
    title?: string
    description?: string
    variant?: "default" | "destructive"
}

const ToastContext = React.createContext<{
    toasts: Toast[]
    toast: (toast: Toast) => void
    removeToast: (id: string) => void
} | null>(null)

export function ToastProviderContext({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const toast = (toast: Toast) => {
        setToasts((prev) => [...prev, { id: Date.now().toString(), ...toast }])
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ toasts, toast, removeToast }}>
    {children}
    </ToastContext.Provider>
)
}

export function useToastStore() {
    const context = React.useContext(ToastContext)
    if (!context) throw new Error("useToastStore must be used within ToastProviderContext")
    return context
}

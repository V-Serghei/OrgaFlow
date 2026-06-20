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
    toast: (toast: Omit<Toast, "id"> & { id?: string }) => void
    removeToast: (id: string) => void
    isActive: (id: string) => boolean
} | null>(null)

export function ToastProviderContext({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const counterRef = React.useRef(0)

    const toast = React.useCallback((t: Omit<Toast, "id"> & { id?: string }) => {
        const id = t.id ?? `toast-${++counterRef.current}`
        setToasts((prev) => {
            if (prev.some((existing) => existing.id === id)) return prev
            return [...prev, { ...t, id }]
        })
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const isActive = React.useCallback((id: string) => {
        return toasts.some((t) => t.id === id)
    }, [toasts])

    return (
        <ToastContext.Provider value={{ toasts, toast, removeToast, isActive }}>
            {children}
        </ToastContext.Provider>
    )
}

export function useToastStore() {
    const context = React.useContext(ToastContext)
    if (!context) throw new Error("useToastStore must be used within ToastProviderContext")
    return context
}

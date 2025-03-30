// src/components/ui/use-toast.ts

type ToastType = "success" | "error" | "info"

export function toast({
                          title,
                          description,
                          type = "success",
                      }: {
    title: string
    description?: string
    type?: ToastType
}) {
    console.log(`[${type.toUpperCase()}] ${title}: ${description || ""}`)
}

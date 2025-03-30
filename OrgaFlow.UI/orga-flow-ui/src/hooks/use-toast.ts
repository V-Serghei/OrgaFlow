import { useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

export function useToast() {
    return {
        toast: useCallback(toast, [])
    }
}

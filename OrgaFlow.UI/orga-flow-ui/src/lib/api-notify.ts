import { toast } from "@/components/ui/use-toast"

export default function apiNotify(message: string, type: "success" | "error" = "success") {
    toast({
        title: type === "success" ? "Успешно" : "Ошибка",
        description: message,
        variant: type === "success" ? "default" : "destructive",
    })
}

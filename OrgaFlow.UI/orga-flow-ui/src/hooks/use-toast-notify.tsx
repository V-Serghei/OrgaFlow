import { useToast } from "@/hooks/use-toast";

export function useToastNotify() {
    const { toast } = useToast();

    function toastNotify(
        message: string,
        type?: string
    ) {
        toast({
            id: Date.now().toString(),
            title: type === "success" ? "Успешно" : "Ошибка",
            description: message,
            variant: type === "success" ? "default" : "destructive",
        });
    }

    return { toastNotify };
}

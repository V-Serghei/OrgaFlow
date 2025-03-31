// client-wrapper.tsx
"use client";

import { Toaster } from "@/components/ui/toaster";
import { ToastProviderContext } from "@/components/ui/use-toast-store";
import React from "react";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ToastProviderContext>
            {children}
            <Toaster />
        </ToastProviderContext>
    );
}

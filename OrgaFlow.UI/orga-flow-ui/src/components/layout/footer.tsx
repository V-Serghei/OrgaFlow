import {Toaster} from "@/components/ui/toaster";
import type React from "react";

export function Footer() {
    return (
        <footer className="border-t bg-background py-4">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} TaskMaster. All rights reserved.
                </p>
                
                <div className="flex gap-4">
                    <a href="#" className="text-sm text-muted-foreground hover:underline">
                        Terms
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:underline">
                        Privacy
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:underline">
                        Contact
                    </a>
                </div>
            </div>
        </footer>
    )
}


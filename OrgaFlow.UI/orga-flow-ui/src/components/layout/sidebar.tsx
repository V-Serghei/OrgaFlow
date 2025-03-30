"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { CheckSquare, Mail, User, Home, Calendar, Settings, X } from "lucide-react"

interface SidebarProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
    const pathname = usePathname()

    const routes = [
        {
            label: "Dashboard",
            icon: Home,
            href: "/",
            active: pathname === "/",
        },
        {
            label: "Tasks",
            icon: CheckSquare,
            href: "/tasks",
            active: pathname === "/tasks",
        },
        {
            label: "Calendar",
            icon: Calendar,
            href: "/calendar",
            active: pathname === "/calendar",
        },
        {
            label: "Email",
            icon: Mail,
            href: "/email",
            active: pathname === "/email",
        },
        {
            label: "Profile",
            icon: User,
            href: "/profile",
            active: pathname === "/profile",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/settings",
            active: pathname === "/settings",
        },
    ]

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="flex h-16 items-center border-b px-4">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-xl font-bold">TaskMaster</span>
                        </Link>
                        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <ScrollArea className="h-[calc(100vh-4rem)]">
                        <div className="px-2 py-4">
                            <nav className="flex flex-col gap-1">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                            route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                                        )}
                                    >
                                        <route.icon className="h-5 w-5" />
                                        {route.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                <ScrollArea className="flex-1">
                    <div className="px-2 py-4">
                        <nav className="flex flex-col gap-1">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                                    )}
                                >
                                    <route.icon className="h-5 w-5" />
                                    {route.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </ScrollArea>
            </aside>
        </>
    )
}


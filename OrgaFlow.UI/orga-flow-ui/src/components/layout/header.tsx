"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Menu } from "lucide-react"
import { apiAuth } from "@/lib/api-auth"


export function Header({ onMenuClick }: { onMenuClick: () => void }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const handleLogout = async () => {
        try {
            const res = await apiAuth.post("logout")

            window.location.href = "/auth/login" 
        } catch (err) {
            console.error("Ошибка при выходе из системы", err)
        }
    }

    useEffect(() => {
        fetch("/api/auth/me", {
            credentials: "include"
        })
            .then(res => {
                if (!res.ok) throw new Error("Unauthenticated")
                return res.json()
            })
            .then(data => {
                if (data.authenticated) {
                    setIsAuthenticated(true)
                } else {
                    setIsAuthenticated(false)
                }
            })
            .catch(() => setIsAuthenticated(false))
    }, [])

    return (
        <header className="fixed left-0 right-0 top-0 z-30 border-b bg-background">
            <div className="flex h-16 items-center px-4 md:px-6">
                <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                <Link href="/" className="flex items-center gap-2">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-primary"
                    >
                        <path d="M16 2C8.268 2 2 8.268 2 16..." stroke="currentColor" />
                    </svg>
                    <span className="text-xl font-bold">OrgaFlow</span>
                </Link>
                <div className="ml-auto flex items-center gap-2">
                    <ModeToggle />
                    {isAuthenticated === null ? (
                        <div>Loading...</div>
                    ) : isAuthenticated ? (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>New task assigned</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/placeholder.svg" alt="User" />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings">Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button asChild variant="outline">
                                <Link href="/auth/login">Login</Link>
                            </Button>
                            <Button asChild variant="default">
                                <Link href="/auth/register">Sign up</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

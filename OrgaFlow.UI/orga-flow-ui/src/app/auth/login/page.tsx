"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {apiAuth} from "@/lib/api-auth";

export default function LoginPage() {
    const router = useRouter()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        rememberMe: false,
    })

    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

        const preparedData = {
            email: isEmail ? formData.email.trim() : "",
            userName: isEmail ? "" : formData.email.trim(),
            password: formData.password,
        };
        // Simulate API call
        setTimeout(async () => {
            setIsLoading(false);
            if (!formData.email ||!formData.password) {
                toast({
                    id: Date.now().toString(),
                    title: "Login Failed",
                    description: "Please check your credentials and try again.",
                    variant: "destructive",
                });
            }
            setIsLoading(true)

            try {
                const res = await apiAuth.post("login", preparedData);
                toast({
                    id: Date.now().toString(),
                    title: "Registration Successful",
                    description: "Your account has been created successfully.",
                })

                router.push("/")
            } catch (error: any) {
                toast({
                    id: Date.now().toString(),
                    title: "Registration failed",
                    description: error.response?.data || "Something went wrong",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }

                // Mock successful login
            if (formData.email && formData.password) {
                toast({
                    id: Date.now().toString(),
                    title: "Login Successful",
                    description: "Welcome back to TaskMaster!",
                });
                router.push("/");
            } else {
                toast({
                    id: Date.now().toString(),
                    title: "Login Failed",
                    description: "Please check your credentials and try again.",
                    variant: "destructive",
                });
            }
        }, 1500);
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <Card className="mx-auto w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Sign in to TaskMaster</CardTitle>
                    <CardDescription>Enter your email and password to access your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember-me"
                                checked={formData.rememberMe}
                                onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked === true })}
                            />
                            <Label htmlFor="remember-me" className="text-sm">
                                Remember me
                            </Label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                        <p className="mt-4 text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/register" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}


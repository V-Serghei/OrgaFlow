"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const { toast } = useToast()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            setIsSubmitted(true)

            toast("Reset Link Sent", "If your email exists in our system, you'll receive a password reset link.")
        }, 1500)
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <Card className="mx-auto w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
                </CardHeader>
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                            <div className="mt-4 text-center">
                                <Link href="/auth/login" className="text-sm text-primary hover:underline inline-flex items-center">
                                    <ArrowLeft className="mr-1 h-3 w-3" />
                                    Back to login
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                ) : (
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-muted p-4 text-center">
                            <p className="text-sm">
                                If an account exists for {email}, we've sent a password reset link to this email address.
                            </p>
                        </div>
                        <Button asChild className="w-full">
                            <Link href="/auth/login">Return to Login</Link>
                        </Button>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}


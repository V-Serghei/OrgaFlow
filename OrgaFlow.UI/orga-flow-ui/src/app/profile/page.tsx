"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    // Mock user data
    const [userData, setUserData] = useState({
        name: "John Doe",
        email: "john@example.com",
        bio: "Frontend developer with 5 years of experience in React and Next.js.",
        avatar: "/placeholder.svg",
    })

    const handleProfileUpdate = (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
            })
        }, 1000)
    }

    const handlePasswordUpdate = (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast({
                title: "Password Updated",
                description: "Your password has been changed successfully.",
            })

            // Reset form
            e.target.reset()
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="grid gap-6 md:grid-cols-[250px_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={userData.avatar} />
                            <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h3 className="text-lg font-medium">{userData.name}</h3>
                            <p className="text-sm text-muted-foreground">{userData.email}</p>
                        </div>
                        <Button className="w-full">Change Avatar</Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general">
                            <Card>
                                <form onSubmit={handleProfileUpdate}>
                                    <CardHeader>
                                        <CardTitle>General Information</CardTitle>
                                        <CardDescription>Update your personal information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={userData.name}
                                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={userData.email}
                                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                value={userData.bio}
                                                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                                                rows={4}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                        <TabsContent value="password">
                            <Card>
                                <form onSubmit={handlePasswordUpdate}>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Update your password to keep your account secure</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password">Current Password</Label>
                                            <Input id="current-password" type="password" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">New Password</Label>
                                            <Input id="new-password" type="password" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                                            <Input id="confirm-password" type="password" required />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? "Updating..." : "Update Password"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}


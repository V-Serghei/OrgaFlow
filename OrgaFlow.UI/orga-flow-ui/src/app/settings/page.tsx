"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    // Mock settings data
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true,
            taskReminders: true,
            taskAssignments: true,
            taskComments: false,
        },
        appearance: {
            theme: "system",
            density: "comfortable",
            fontSize: "medium",
        },
        privacy: {
            profileVisibility: "public",
            activityStatus: true,
            shareTaskHistory: false,
        },
    })

    const handleSaveSettings = (section) => {
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast({
                title: "Settings Saved",
                description: `Your ${section} settings have been updated.`,
            })
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your application preferences
                </p>
            </div>

            <Tabs defaultValue="notifications" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Configure how and when you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Notification Channels</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="email-notifications">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive notifications via email
                                            </p>
                                        </div>
                                        <Switch
                                            id="email-notifications"
                                            checked={settings.notifications.email}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifications: { ...settings.notifications, email: checked },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="push-notifications">Push Notifications</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive notifications in your browser
                                            </p>
                                        </div>
                                        <Switch
                                            id="push-notifications"
                                            checked={settings.notifications.push}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifications: { ...settings.notifications, push: checked },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Notification Types</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="task-reminders">Task Reminders</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified about upcoming task deadlines
                                            </p>
                                        </div>
                                        <Switch
                                            id="task-reminders"
                                            checked={settings.notifications.taskReminders}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifications: { ...settings.notifications, taskReminders: checked },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="task-assignments">Task Assignments</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified when you're assigned to a task
                                            </p>
                                        </div>
                                        <Switch
                                            id="task-assignments"
                                            checked={settings.notifications.taskAssignments}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifications: { ...settings.notifications, taskAssignments: checked },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="task-comments">Task Comments</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified when someone comments on your tasks
                                            </p>
                                        </div>
                                        <Switch
                                            id="task-comments"
                                            checked={settings.notifications.taskComments}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifications: { ...settings.notifications, taskComments: checked },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => handleSaveSettings("notification")}
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance Settings</CardTitle>
                            <CardDescription>
                                Customize how the application looks
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="theme">Theme</Label>
                                    <Select
                                        value={settings.appearance.theme}
                                        onValueChange={(value) =>
                                            setSettings({
                                                ...settings,
                                                appearance: { ...settings.appearance, theme: value },
                                            })
                                        }
                                    >
                                        <SelectTrigger id="theme">
                                            <SelectValue placeholder="Select theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="system">System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Choose your preferred theme or use system settings
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="density">Interface Density</Label>
                                    <Select
                                        value={settings.appearance.density}
                                        onValueChange={(value) =>
                                            setSettings({
                                                ...settings,
                                                appearance: { ...settings.appearance, density: value },
                                            })
                                        }
                                    >
                                        <SelectTrigger id="density">
                                            <SelectValue placeholder="Select density" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="compact">Compact</SelectItem>
                                            <SelectItem value="comfortable">Comfortable</SelectItem>
                                            <SelectItem value="spacious">Spacious</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Adjust the spacing between elements
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="font-size">Font Size</Label>
                                    <Select
                                        value={settings.appearance.fontSize}
                                        onValueChange={(value) =>
                                            setSettings({
                                                ...settings,
                                                appearance: { ...settings.appearance, fontSize: value },
                                            })
                                        }
                                    >
                                        <SelectTrigger id="font-size">
                                            <SelectValue placeholder="Select font size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small">Small</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="large">Large</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Adjust the text size throughout the application
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => handleSaveSettings("appearance")}
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="privacy">
                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy Settings</CardTitle>
                            <CardDescription>
                                Control your privacy and data sharing preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                                    <Select
                                        value={settings.privacy.profileVisibility}
                                        onValueChange={(value) =>
                                            setSettings({
                                                ...settings,
                                                privacy: { ...settings.privacy, profileVisibility: value },
                                            })
                                        }
                                    >
                                        <SelectTrigger id="profile-visibility">
                                            <SelectValue placeholder="Select visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public</SelectItem>
                                            <SelectItem value="team">Team Only</SelectItem>
                                            <SelectItem value="private">Private</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Control who can see your profile information
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="activity-status">Activity Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show when you're active in the application
                                        </p>
                                    </div>
                                    <Switch
                                        id="activity-status"
                                        checked={settings.privacy.activityStatus}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                privacy: { ...settings.privacy, activityStatus: checked },
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="share-task-history">Share Task History</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow others to see your task completion history
                                        </p>
                                    </div>
                                    <Switch
                                        id="share-task-history"
                                        checked={settings.privacy.shareTaskHistory}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                privacy: { ...settings.privacy, shareTaskHistory: checked },
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Data Management</h3>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Download or delete all your data from our servers
                                    </p>
                                    <div className="flex gap-4">
                                        <Button variant="outline">Download My Data</Button>
                                        <Button variant="destructive">Delete My Account</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => handleSaveSettings("privacy")}
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

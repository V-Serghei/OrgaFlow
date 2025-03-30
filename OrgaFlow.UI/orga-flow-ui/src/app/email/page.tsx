"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Archive, Star, Trash2 } from "lucide-react"

// Mock email data
const emails = [
    {
        id: 1,
        from: "John Doe",
        email: "john@example.com",
        subject: "Project Update",
        preview: "Hi, I wanted to share the latest updates on our project...",
        date: "10:30 AM",
        read: false,
        starred: true,
    },
    {
        id: 2,
        from: "Sarah Johnson",
        email: "sarah@example.com",
        subject: "Meeting Tomorrow",
        preview: "Just a reminder about our meeting scheduled for tomorrow at 2 PM...",
        date: "Yesterday",
        read: true,
        starred: false,
    },
    {
        id: 3,
        from: "Alex Williams",
        email: "alex@example.com",
        subject: "Task Assignment",
        preview: "I've assigned you a new task in our project management system...",
        date: "Mar 28",
        read: true,
        starred: false,
    },
    {
        id: 4,
        from: "Emily Davis",
        email: "emily@example.com",
        subject: "Question about the report",
        preview: "I was reviewing the quarterly report and had a question about...",
        date: "Mar 27",
        read: false,
        starred: false,
    },
    {
        id: 5,
        from: "Michael Brown",
        email: "michael@example.com",
        subject: "Vacation Request",
        preview: "I'd like to request vacation days from April 15 to April 22...",
        date: "Mar 25",
        read: true,
        starred: true,
    },
]

export default function EmailPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedEmails, setSelectedEmails] = useState([])

    const filteredEmails = emails.filter(
        (email) =>
            email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.preview.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const toggleEmailSelection = (id) => {
        if (selectedEmails.includes(id)) {
            setSelectedEmails(selectedEmails.filter((emailId) => emailId !== id))
        } else {
            setSelectedEmails([...selectedEmails, id])
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Email</h2>
                <p className="text-muted-foreground">Manage your messages and communications</p>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search emails..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {selectedEmails.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <Tabs defaultValue="inbox" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="inbox">Inbox</TabsTrigger>
                    <TabsTrigger value="starred">Starred</TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                    <TabsTrigger value="drafts">Drafts</TabsTrigger>
                </TabsList>
                <TabsContent value="inbox" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inbox</CardTitle>
                            <CardDescription>You have {emails.filter((e) => !e.read).length} unread messages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {filteredEmails.map((email) => (
                                    <div
                                        key={email.id}
                                        className={`flex items-center gap-2 rounded-md p-2 hover:bg-muted ${!email.read ? "bg-muted/50" : ""}`}
                                        onClick={() => toggleEmailSelection(email.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedEmails.includes(email.id)}
                                            onChange={() => {}}
                                            className="h-4 w-4"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                // Toggle star logic would go here
                                            }}
                                        >
                                            <Star className={`h-4 w-4 ${email.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                                        </Button>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`/placeholder.svg?text=${email.from.charAt(0)}`} />
                                            <AvatarFallback>{email.from.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`truncate font-medium ${!email.read ? "font-semibold" : ""}`}>{email.from}</p>
                                                <span className="text-xs text-muted-foreground">{email.date}</span>
                                            </div>
                                            <p className="truncate text-sm">{email.subject}</p>
                                            <p className="truncate text-xs text-muted-foreground">{email.preview}</p>
                                        </div>
                                        {!email.read && <Badge variant="secondary" className="ml-2 h-2 w-2 rounded-full p-0" />}
                                    </div>
                                ))}

                                {filteredEmails.length === 0 && (
                                    <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                        <p className="text-sm text-muted-foreground">No emails found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="starred">
                    <Card>
                        <CardHeader>
                            <CardTitle>Starred</CardTitle>
                            <CardDescription>Your important messages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {filteredEmails
                                    .filter((email) => email.starred)
                                    .map((email) => (
                                        <div
                                            key={email.id}
                                            className={`flex items-center gap-2 rounded-md p-2 hover:bg-muted ${!email.read ? "bg-muted/50" : ""}`}
                                        >
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            </Button>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`/placeholder.svg?text=${email.from.charAt(0)}`} />
                                                <AvatarFallback>{email.from.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`truncate font-medium ${!email.read ? "font-semibold" : ""}`}>{email.from}</p>
                                                    <span className="text-xs text-muted-foreground">{email.date}</span>
                                                </div>
                                                <p className="truncate text-sm">{email.subject}</p>
                                                <p className="truncate text-xs text-muted-foreground">{email.preview}</p>
                                            </div>
                                        </div>
                                    ))}

                                {filteredEmails.filter((email) => email.starred).length === 0 && (
                                    <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                        <p className="text-sm text-muted-foreground">No starred emails</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="sent">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sent</CardTitle>
                            <CardDescription>Messages you've sent</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                <p className="text-sm text-muted-foreground">No sent emails to display</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="drafts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Drafts</CardTitle>
                            <CardDescription>Your saved drafts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                <p className="text-sm text-muted-foreground">No drafts to display</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}


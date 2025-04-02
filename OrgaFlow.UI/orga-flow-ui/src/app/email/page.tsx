"use client"

import { useEffect, useState } from "react"
import { apiMail } from "@/lib/api-mail"
import type { EmailMessage } from "@/types/EmailMessage"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Archive, Star, Trash2 } from "lucide-react"

export default function EmailPage() {
    const [emails, setEmails] = useState<EmailMessage[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedEmails, setSelectedEmails] = useState<number[]>([])

    useEffect(() => {
        const fetchEmails = async () => {
            try {
                const res = await apiMail.post("inbox", {
                    provider: "gmail",
                    username: "vistovschiiserghei@gmail.com",
                    password: "wvik gtpm hjsv ybfe",
                })
                setEmails(res.data)
            } catch (err) {
                console.error("Ошибка при получении писем", err)
            }
        }

        fetchEmails()
    }, [])

    const filteredEmails = emails.filter((email) => {
        const subject = email.subject?.toLowerCase() || ""
        const from = email.from?.toLowerCase() || ""
        const preview = email.bodyPreview?.toLowerCase() || ""
        const search = searchTerm.toLowerCase()

        return subject.includes(search) || from.includes(search) || preview.includes(search)
    })

    const toggleEmailSelection = (id: number) => {
        setSelectedEmails((prev) =>
            prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
        )
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
                            <CardDescription>You have {emails.filter(e => !e.read).length} unread messages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {filteredEmails.map((email, index) => (
                                    <div
                                        key={email.date + email.subject + index}
                                        className={`flex items-center gap-2 rounded-md p-2 hover:bg-muted ${!email.read ? "bg-muted/50" : ""}`}
                                        onClick={() => toggleEmailSelection(index)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedEmails.includes(index)}
                                            onChange={() => {}}
                                            className="h-4 w-4"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                // logic for toggling star
                                            }}
                                        >
                                            <Star className={`h-4 w-4 ${email.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                                        </Button>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`/placeholder.svg?text=${email.from?.charAt(0)}`} />
                                            <AvatarFallback>{email.from?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`truncate font-medium ${!email.read ? "font-semibold" : ""}`}>{email.from}</p>
                                                <span className="text-xs text-muted-foreground">{new Date(email.date).toLocaleString()}</span>
                                            </div>
                                            <p className="truncate text-sm">{email.subject}</p>
                                            <p className="truncate text-xs text-muted-foreground">{email.bodyPreview}</p>
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

                {/* You can add Starred / Sent / Drafts here if needed */}
            </Tabs>
        </div>
    )
}

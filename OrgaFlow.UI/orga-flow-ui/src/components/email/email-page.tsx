"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Archive, Star, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmailDetailModal } from "@/components/email/email-detail-modal"
import { ReplyModal } from "@/components/email/reply-modal"
import { apiMail } from "@/lib/api-mail"

// Define the email message interface
interface EmailMessage {
    uid: string
    subject: string
    from: string
    date: string
    bodyPreview: string
    bodyHtml?: string
    bodyText?: string
    read: boolean
    starred: boolean
}

export default function EmailPage() {
    const { toast } = useToast()
    const [emails, setEmails] = useState<EmailMessage[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedEmails, setSelectedEmails] = useState<string[]>([])
    const [viewingEmail, setViewingEmail] = useState<EmailMessage | null>(null)
    const [replyingToEmail, setReplyingToEmail] = useState<EmailMessage | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("inbox")

    // Fetch emails on component mount
    useEffect(() => {
        fetchEmails()
    }, [activeTab])

    const fetchEmails = async () => {
        setIsLoading(true)
        setError(null)
        try {
            // In a real app, this would use a secure authentication method
            // and fetch emails from your backend API
            const response = await apiMail.get(`/${activeTab}`)
            setEmails(response.data)
        } catch (err) {
            console.error("Error fetching emails:", err)
            setError("Failed to load emails. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredEmails = emails.filter(
        (email) =>
            email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.bodyPreview.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const toggleEmailSelection = (uid: string, event: React.MouseEvent) => {
        event.stopPropagation()
        setSelectedEmails((prev) => (prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]))
    }

    const handleOpenEmail = async (email: EmailMessage) => {
        setIsLoading(true)
        try {
            // In a real app, fetch the full email content if needed
            const response = await apiMail.get(`/message/${email.uid}`)
            setViewingEmail(response.data)

            // Mark as read if it wasn't already
            if (!email.read) {
                await apiMail.post(`/markAsRead`, { uids: [email.uid] })
                setEmails(emails.map((e) => (e.uid === email.uid ? { ...e, read: true } : e)))
            }
        } catch (err) {
            console.error("Error opening email:", err)
            
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteSelected = async () => {
        if (selectedEmails.length === 0) return

        setIsLoading(true)
        try {
            await apiMail.post("/delete", { uids: selectedEmails })

            // Remove deleted emails from the state
            setEmails(emails.filter((email) => !selectedEmails.includes(email.uid)))
            setSelectedEmails([])

            
        } catch (err) {
            console.error("Error deleting emails:", err)
            
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleStar = async (email: EmailMessage, event: React.MouseEvent) => {
        event.stopPropagation()

        try {
            const newStarredState = !email.starred
            await apiMail.post("/toggleStar", {
                uid: email.uid,
                starred: newStarredState,
            })

            // Update the email in state
            setEmails(emails.map((e) => (e.uid === email.uid ? { ...e, starred: newStarredState } : e)))
        } catch (err) {
            console.error("Error toggling star:", err)
            
        }
    }

    const handleSendReply = async (replyData: { to: string; subject: string; body: string }) => {
        setIsLoading(true)
        try {
            await apiMail.post("/send", replyData)

            setReplyingToEmail(null)
            
        } catch (err) {
            console.error("Error sending reply:", err)
            
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Email</h2>
                <p className="text-muted-foreground">Manage your messages and communications</p>
            </div>

            {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">{error}</div>}

            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search emails..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {selectedEmails.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="Archive">
                            <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete" onClick={handleDeleteSelected} disabled={isLoading}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <Tabs defaultValue="inbox" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
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
                            {isLoading && emails.length === 0 ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredEmails.map((email) => (
                                        <div
                                            key={email.uid}
                                            className={`flex items-start gap-2 rounded-md p-2 hover:bg-muted cursor-pointer ${
                                                !email.read ? "bg-muted/50" : ""
                                            } ${selectedEmails.includes(email.uid) ? "bg-primary/10" : ""}`}
                                            onClick={() => handleOpenEmail(email)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedEmails.includes(email.uid)}
                                                onChange={(e) => e.stopPropagation()}
                                                onClick={(e) => toggleEmailSelection(email.uid, e)}
                                                className="h-4 w-4 mt-1"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => handleToggleStar(email, e)}
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
                                                    <span className="text-xs text-muted-foreground">{new Date(email.date).toLocaleString()}</span>
                                                </div>
                                                <p className="truncate text-sm">{email.subject}</p>
                                                <p className="truncate text-xs text-muted-foreground">{email.bodyPreview}</p>
                                            </div>
                                            {!email.read && <Badge variant="secondary" className="ml-2 h-2 w-2 rounded-full p-0 mt-1" />}
                                        </div>
                                    ))}

                                    {filteredEmails.length === 0 && (
                                        <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                            <p className="text-sm text-muted-foreground">No emails found</p>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                            key={email.uid}
                                            className={`flex items-center gap-2 rounded-md p-2 hover:bg-muted cursor-pointer ${
                                                !email.read ? "bg-muted/50" : ""
                                            }`}
                                            onClick={() => handleOpenEmail(email)}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => handleToggleStar(email, e)}
                                            >
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            </Button>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`/placeholder.svg?text=${email.from.charAt(0)}`} />
                                                <AvatarFallback>{email.from.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`truncate font-medium ${!email.read ? "font-semibold" : ""}`}>{email.from}</p>
                                                    <span className="text-xs text-muted-foreground">{new Date(email.date).toLocaleString()}</span>
                                                </div>
                                                <p className="truncate text-sm">{email.subject}</p>
                                                <p className="truncate text-xs text-muted-foreground">{email.bodyPreview}</p>
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

            {/* Email Detail Modal */}
            {viewingEmail && (
                <EmailDetailModal
                    email={viewingEmail}
                    onClose={() => setViewingEmail(null)}
                    onReply={() => {
                        setViewingEmail(null)
                        setReplyingToEmail(viewingEmail)
                    }}
                    isLoading={isLoading}
                />
            )}

            {/* Reply Modal */}
            {replyingToEmail && (
                <ReplyModal
                    originalEmail={replyingToEmail}
                    onClose={() => setReplyingToEmail(null)}
                    onSend={handleSendReply}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}


"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Send } from "lucide-react"

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

interface ReplyModalProps {
    originalEmail: EmailMessage
    onClose: () => void
    onSend: (replyData: { to: string; subject: string; body: string }) => void
    isLoading: boolean
}

export function ReplyModal({ originalEmail, onClose, onSend, isLoading }: ReplyModalProps) {
    const [to, setTo] = useState(originalEmail.from)
    const [subject, setSubject] = useState(`Re: ${originalEmail.subject}`)
    const [body, setBody] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSend({ to, subject, body })
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Reply to Email</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="to">To</Label>
                        <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} disabled={isLoading} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="body">Message</Label>
                        <Textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={10}
                            disabled={isLoading}
                            required
                            placeholder="Type your reply here..."
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Reply
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}


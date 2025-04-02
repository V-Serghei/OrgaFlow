"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Reply, Trash2, Star } from "lucide-react"

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

interface EmailDetailModalProps {
    email: EmailMessage
    onClose: () => void
    onReply: (email: EmailMessage) => void
    isLoading: boolean
}

export function EmailDetailModal({ email, onClose, onReply, isLoading }: EmailDetailModalProps) {
    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <DialogTitle className="text-xl">{email.subject}</DialogTitle>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onReply(email)}>
                                <Reply className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Star className={`h-4 w-4 ${email.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <div>
                            <span className="font-medium">From: </span>
                            {email.from}
                        </div>
                        <div>{new Date(email.date).toLocaleString()}</div>
                    </div>

                    <div className="border-t pt-4">
                        {email.bodyHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: email.bodyHtml }} />
                        ) : (
                            <div className="whitespace-pre-wrap">{email.bodyText || email.bodyPreview}</div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


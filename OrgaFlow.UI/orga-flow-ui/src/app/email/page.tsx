"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; 
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; 
import { EmailDetailModal } from "@/components/email/email-detail-modal";
import { ReplyModal } from "@/components/email/reply-modal";
import type { EmailMessage } from "@/types/EmailMessage";
import { apiMail } from "@/lib/api-mail";
import { Archive, Star, Trash2 } from "lucide-react"; 

export default function Page() {
    const [emails, setEmails] = useState<EmailMessage[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [viewingEmail, setViewingEmail] = useState<EmailMessage | null>(null);
    const [replyingToEmail, setReplyingToEmail] = useState<EmailMessage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [authDetails, setAuthDetails] = useState({
        provider: "mail",
        username: "vistovskii2002@mail.ru",
        password: "",
    });

    useEffect(() => {
        const fetchEmails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await apiMail.post("inbox", authDetails);
                setEmails(res.data);
            } catch (err) {
                console.error("Ошибка при получении писем", err);
                setError("Не удалось загрузить письма.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmails();
    }, [authDetails]);

    // Реализована фильтрация
    const filteredEmails = emails.filter((email) => {
        const subject = email.subject?.toLowerCase() || "";
        const from = email.from?.toLowerCase() || "";
        const preview = email.bodyPreview?.toLowerCase() || "";
        const search = searchTerm.toLowerCase().trim();
        if (!search) return true;
        return subject.includes(search) || from.includes(search) || preview.includes(search);
    });

    const toggleEmailSelection = (uid: string) => {
        setSelectedEmails((prev) =>
            prev.includes(uid) ? prev.filter((eUid) => eUid !== uid) : [...prev, uid]
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedEmails.length === 0) return;
        setIsLoading(true);
        setError(null);
        try {
            await apiMail.post("trash", { auth: authDetails, uids: selectedEmails });
            setEmails((prevEmails) => prevEmails.filter((email) => !selectedEmails.includes(email.uid)));
            setSelectedEmails([]);
        } catch (err) {
            console.error("Ошибка при удалении писем", err);
            setError("Не удалось удалить письма.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEmail = async (emailUid: string) => {
        setIsLoading(true);
        setError(null);
        setViewingEmail(null);
        try {
            const response = await apiMail.post(`messageDetails`, { auth: authDetails, uid: emailUid });
            setViewingEmail(response.data);
            setEmails(prev => prev.map(e => e.uid === emailUid ? {...e, read: true} : e));
        } catch (err) {
            console.error("Ошибка при загрузке деталей письма", err);
            setError("Не удалось загрузить детали письма.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseDetailModal = () => setViewingEmail(null);
    const handleOpenReplyModal = (email: EmailMessage) => {
        setViewingEmail(null);
        setReplyingToEmail(email);
    }
    const handleCloseReplyModal = () => setReplyingToEmail(null);

    const handleSendReply = async (replyData: { to: string; subject: string; body: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiMail.post("send", {
                auth: authDetails,
                to: replyData.to,
                subject: replyData.subject,
                body: replyData.body,
            });
            setReplyingToEmail(null);
        } catch (err) {
            console.error("Ошибка при отправке ответа", err);
            setError("Не удалось отправить ответ.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">

            {error && <div className="p-2 text-red-600 border border-red-600 rounded">{error}</div>}

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
                            <Archive className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete" onClick={handleDeleteSelected} disabled={isLoading}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        {isLoading && <span className="text-xs">Processing...</span>}
                    </div>
                )}
            </div>

            <Tabs defaultValue="inbox" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="inbox">Inbox</TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inbox</CardTitle>
                            <CardDescription>
                                You have {emails.filter(e => !e.read).length} unread messages.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading && emails.length === 0 && <div className="text-center p-4">Loading emails...</div>}
                            {!isLoading && filteredEmails.length === 0 && <div className="text-center p-4 text-muted-foreground">No emails found.</div>}
                            <div className="space-y-1">
                                {filteredEmails.map((email) => (
                                    <div
                                        key={email.uid}
                                        className={`flex items-start gap-3 p-2 rounded-md cursor-pointer hover:bg-muted ${!email.read ? "bg-muted/50 font-semibold" : ""} ${selectedEmails.includes(email.uid) ? "ring-2 ring-blue-500 ring-offset-1" : ""}`} // Улучшил выделение
                                        onClick={() => handleOpenEmail(email.uid)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedEmails.includes(email.uid)}
                                            onChange={() => toggleEmailSelection(email.uid)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-4 h-4 mt-1"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-6 h-6 shrink-0" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log("Toggle star for:", email.uid);
                                                // TODO: Toggle star logic + API call
                                            }}
                                        >
                                            <Star className={`h-4 w-4 ${email.starred ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                                        </Button>
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={`/placeholder.svg?text=${email.from?.charAt(0)}`} alt={email.from ?? 'Sender'} />
                                            <AvatarFallback>{email.from?.charAt(0).toUpperCase() ?? '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`truncate font-medium ${!email.read ? "font-semibold" : ""}`}>{email.from}</p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap pl-2">{new Date(email.date).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm truncate">{email.subject}</p>
                                            <p className="text-xs truncate text-muted-foreground">{email.bodyPreview}</p>
                                        </div>
                                        {!email.read && <Badge variant="secondary" className="w-2 h-2 p-0 mt-1 rounded-full shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {viewingEmail && (
                <EmailDetailModal
                    email={viewingEmail} 
                    onClose={handleCloseDetailModal}
                    onReply={handleOpenReplyModal}
                    isLoading={isLoading}
                />
            )}

            {replyingToEmail && (
                <ReplyModal
                    originalEmail={replyingToEmail} 
                    onClose={handleCloseReplyModal}
                    onSend={handleSendReply}
                    isLoading={isLoading}
                />
            )}
        </div> 
    ); 
} 
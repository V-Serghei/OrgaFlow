// Create or update the EmailMessage interface to include all required properties
export interface EmailMessage {
    uid: string; // <-- Добавить UID
    subject?: string;
    from?: string;
    date: string; // или Date
    bodyPreview?: string;
    bodyHtml?: string; // Для детального просмотра
    bodyText?: string; // Для детального просмотра
    read: boolean;
    starred?: boolean;
}


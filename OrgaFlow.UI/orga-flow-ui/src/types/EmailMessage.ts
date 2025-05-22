// Create or update the EmailMessage interface to include all required properties
export interface EmailMessage {
    uid: string; 
    subject?: string;
    from?: string;
    date: string; 
    bodyPreview?: string;
    bodyHtml?: string; 
    bodyText?: string; 
    read: boolean;
    starred?: boolean;
}


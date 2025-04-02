// Create or update the EmailMessage interface to include all required properties
export interface EmailMessage {
    id: number
    from: string
    email?: string
    subject: string
    preview: string
    date: string
    read: boolean
    starred: boolean
}


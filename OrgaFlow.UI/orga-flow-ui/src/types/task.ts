// src/types/task.ts
export type Task = {
    id: string
    name: string
    description?: string
    status: boolean
    startDate?: string
    endDate?: string
    notify?: boolean
}

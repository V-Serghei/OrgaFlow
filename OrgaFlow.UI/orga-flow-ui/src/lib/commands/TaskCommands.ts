"use client";

import { useState } from "react";
import { ICommand } from './CommandInterface';
import api from '@/lib/api';

export class CreateTaskCommand implements ICommand {
    private createdTask: any = null;

    constructor(private taskData: any) {}

    async execute(): Promise<any> {
        try {
            const response = await api.post('/', this.taskData);
            this.createdTask = response.data;
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            throw error;
        }
    }

    async undo(): Promise<boolean> {
        if (!this.createdTask?.id) return false;

        try {
            await api.delete(`/${this.createdTask.id}`);
            return true;
        } catch (error) {
            console.error('Ошибка при отмене создания задачи:', error);
            return false;
        }
    }

    async redo(): Promise<any> {
        return this.execute();
    }
}

export class UpdateTaskCommand implements ICommand {
    private originalTask: any = null;

    constructor(private id: number, private taskData: any) {}

    async execute(): Promise<any> {
        try {
            const getResponse = await api.get(`/${this.id}`);
            const task = getResponse.data;
             this.originalTask =  {
                Name: task.name,
                Description: task.description,
                Type: task.type,
                Importance: typeof task.importance === 'number' ? task.importance : task.priority,
                Status: task.status,
                StartDate: task.startDate,
                EndDate: task.endDate,
                StartTime: task.startTime || "",
                EndTime: task.endTime || "",
                Location: task.location || "",
                IsAllDay: task.isAllDay,
                IsRecurring: task.isRecurring,
                RecurrencePattern: task.recurrencePattern || "",
                Notify: task.notify,
                AssignedTo: task.assignedTo,
                UpdatedBy: task.updatedBy || task.createdBy || "V-Serghei",
                UpdatedAt: new Date().toISOString(),
                ParentId: task.parentId,
                Participants: (task.participants || []).map(p => ({
                Id: p.id,
                Name: p.name,
                Avatar: p.avatar || ""
            })),
                Tags: (task.tags || []).map(t => ({
                Id: t.id,
                Name: t.name,
                Color: t.color || ""
            }))
        };
            

            const response = await api.put(`/${this.id}`, this.taskData);
            return response.data;
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            throw error;
        }
    }

    async undo(): Promise<boolean> {
        if (!this.originalTask) return false;

        try {
            const taskData = this.originalTask;
            
            await api.put(`/${this.id}`, taskData);
            return true;
        } catch (error) {
            console.error('Ошибка при отмене обновления задачи:', error);
            return false;
        }
    }

    async redo(): Promise<any> {
        try {
            const response = await api.put(`/${this.id}`, this.taskData);
            return response.data;
        } catch (error) {
            console.error('Ошибка при повторе обновления задачи:', error);
            throw error;
        }
    }
}
export class DeleteTaskCommand implements ICommand {
    private deletedTask: any = null;

    constructor(private id: number) {}

    async execute(): Promise<any> {
        try {
            const getResponse = await api.get(`/${this.id}`);
            this.deletedTask = getResponse.data;

            await api.delete(`/${this.id}`);
            return { id: this.id };
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
            throw error;
        }
    }

    async undo(): Promise<boolean> {
        if (!this.deletedTask) return false;

        try {
            await api.post('/', this.deletedTask);
            return true;
        } catch (error) {
            console.error('Ошибка при отмене удаления задачи:', error);
            return false;
        }
    }

    async redo(): Promise<any> {
        return this.execute();
    }
}
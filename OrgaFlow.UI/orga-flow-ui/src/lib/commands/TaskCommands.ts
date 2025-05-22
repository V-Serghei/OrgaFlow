"use client";

import { useState } from "react";
import { ICommand } from './CommandInterface';
import api from '@/lib/api';
export class CreateTaskCommand implements ICommand {
    constructor(public taskData: any) {}

    async execute(): Promise<any> {
        try {
            const response = await api.post('/', this.taskData);
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            throw error;
        }
    }

    async undo(): Promise<boolean> {
        return true;
    }

    async redo(): Promise<any> {
        return this.execute();
    }
}

export class UpdateTaskCommand implements ICommand {
    constructor(public id: number, public taskData: any) {}

    async execute(): Promise<any> {
        try {
            const response = await api.put(`/${this.id}`, this.taskData);
            return response.data;
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            throw error;
        }
    }

    async undo(): Promise<boolean> {
        return true;
    }

    async redo(): Promise<any> {
        return this.execute();
    }
}

export class DeleteTaskCommand implements ICommand {
    constructor(public id: number) {}

    async execute(): Promise<any> {
        try {
            await api.delete(`/${this.id}`);
            return { id: this.id };
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
            throw error;
        }
    }

    async undo(): Promise<boolean> {
        return true;
    }

    async redo(): Promise<any> {
        return this.execute();
    }
}
import { ICommand } from './CommandInterface';
import api from '@/lib/api';

export class CreateTaskCommand implements ICommand {
    private createdTaskId: number | null = null;

    constructor(private taskData: any) {}

    async execute(): Promise<any> {
        try {
            const response = await api.post('/task', this.taskData);
            this.createdTaskId = response.data.id;
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            throw error;
        }
    }

    async undo(): Promise<boolean> {
        if (!this.createdTaskId) return false;

        try {
            await api.post(`/task/undo`);
            return true;
        } catch (error) {
            console.error('Ошибка при отмене создания задачи:', error);
            return false;
        }
    }
}

export class UpdateTaskCommand implements ICommand {
    private originalTask: any = null;

    constructor(private id: number, private taskData: any) {}

    async execute(): Promise<any> {
        try {
            const getResponse = await api.get(`/task/${this.id}`);
            this.originalTask = getResponse.data;

            const response = await api.put(`/task/${this.id}`, this.taskData);
            return response.data;
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            throw error;
        }
    }

    async undo(): Promise<boolean> {
        try {
            await api.post(`/task/undo`);
            return true;
        } catch (error) {
            console.error('Ошибка при отмене обновления задачи:', error);
            return false;
        }
    }

    async redo(): Promise<any> {
        try {
            return await api.put(`/task/${this.id}`, this.taskData);
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
            const getResponse = await api.get(`/task/${this.id}`);
            this.deletedTask = getResponse.data;

            const response = await api.delete(`/task/${this.id}`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
            throw error;
        }
    }

    async undo(): Promise<boolean> {
        try {
            await api.post(`/task/undo`);
            return true;
        } catch (error) {
            console.error('Ошибка при отмене удаления задачи:', error);
            return false;
        }
    }
}
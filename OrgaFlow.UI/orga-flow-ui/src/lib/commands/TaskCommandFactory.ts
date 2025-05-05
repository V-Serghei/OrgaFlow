import { CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand } from './TaskCommands';

export class TaskCommandFactory {
    createCreateCommand(taskData: any) {
        return new CreateTaskCommand(taskData);
    }

    createUpdateCommand(id: number, taskData: any) {
        return new UpdateTaskCommand(id, taskData);
    }

    createDeleteCommand(id: number) {
        return new DeleteTaskCommand(id);
    }
}
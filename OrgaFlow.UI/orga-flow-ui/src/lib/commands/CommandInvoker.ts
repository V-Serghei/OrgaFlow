import { ICommand } from './CommandInterface';

export class CommandInvoker {
    private history: ICommand[] = [];
    private currentIndex: number = -1;

    async executeCommand(command: ICommand): Promise<any> {
        try {
            if (this.currentIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.currentIndex + 1);
            }

            const result = await command.execute();

            this.history.push(command);
            this.currentIndex = this.history.length - 1;

            return result;
        } catch (error) {
            console.error("Ошибка выполнения команды:", error);
            throw error;
        }
    }

    async undoCommand(): Promise<boolean> {
        if (this.currentIndex < 0) return false;

        try {
            const successful = await this.history[this.currentIndex].undo();
            if (successful) {
                this.currentIndex--;
            }
            return successful;
        } catch (error) {
            console.error("Ошибка отмены команды:", error);
            return false;
        }
    }

    async redoCommand(): Promise<boolean> {
        if (this.currentIndex >= this.history.length - 1) return false;

        try {
            this.currentIndex++;
            const command = this.history[this.currentIndex];

            if (command.redo) {
                await command.redo();
            } else {
                await command.execute();
            }

            return true;
        } catch (error) {
            console.error("Ошибка повтора команды:", error);
            this.currentIndex--; 
            return false;
        }
    }

    canUndo(): boolean {
        return this.currentIndex >= 0;
    }

    canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }
}
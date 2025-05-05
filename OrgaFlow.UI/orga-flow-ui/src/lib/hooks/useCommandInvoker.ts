import { useState, useEffect } from 'react';
import { CommandInvoker } from '../commands/CommandInvoker';
import { ICommand } from '../commands/CommandInterface';
import { useToast } from '@/hooks/use-toast';

export const globalCommandInvoker = new CommandInvoker();

export function useCommandInvoker() {
    const { toast } = useToast();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    useEffect(() => {
        setCanUndo(globalCommandInvoker.canUndo());
        setCanRedo(globalCommandInvoker.canRedo());
    }, []);

    const executeCommand = async (command: ICommand) => {
        try {
            const result = await globalCommandInvoker.executeCommand(command);

            setCanUndo(globalCommandInvoker.canUndo());
            setCanRedo(globalCommandInvoker.canRedo());

            return result;
        } catch (error) {
            toast({
                title: "Ошибка выполнения команды",
                description: error.message || "Произошла ошибка",
                variant: "destructive",
            });
            throw error;
        }
    };

    const undo = async () => {
        try {
            const success = await globalCommandInvoker.undoCommand();

            if (success) {
                toast({
                    title: "Действие отменено",
                    description: "Последнее действие было успешно отменено",
                });
            } else {
                toast({
                    title: "Невозможно отменить",
                    description: "Нет действий для отмены или отмена не удалась",
                    variant: "destructive",
                });
            }

            setCanUndo(globalCommandInvoker.canUndo());
            setCanRedo(globalCommandInvoker.canRedo());

            return success;
        } catch (error) {
            toast({
                title: "Ошибка отмены команды",
                description: error.message || "Произошла ошибка",
                variant: "destructive",
            });
            return false;
        }
    };

    const redo = async () => {
        try {
            const success = await globalCommandInvoker.redoCommand();

            if (success) {
                toast({
                    title: "Действие повторено",
                    description: "Действие было успешно повторено",
                });
            } else {
                toast({
                    title: "Невозможно повторить",
                    description: "Нет действий для повторения или повторение не удалось",
                    variant: "destructive",
                });
            }

            setCanUndo(globalCommandInvoker.canUndo());
            setCanRedo(globalCommandInvoker.canRedo());

            return success;
        } catch (error) {
            toast({
                title: "Ошибка повтора команды",
                description: error.message || "Произошла ошибка",
                variant: "destructive",
            });
            return false;
        }
    };

    return { executeCommand, undo, redo, canUndo, canRedo };
}
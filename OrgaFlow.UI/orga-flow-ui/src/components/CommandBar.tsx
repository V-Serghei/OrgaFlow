import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import { useCommandInvoker } from '@/lib/hooks/useCommandInvoker';
import { useParams } from 'next/navigation';

export const TaskRefreshContext = React.createContext(() => {});

export function CommandBar() {
    const { undo, redo, canUndo, canRedo } = useCommandInvoker();
    const refreshTask = useContext(TaskRefreshContext);

    const handleUndo = async () => {
        if (canUndo) {
            await undo();
            // Вызываем функцию обновления
            refreshTask();
        }
    };

    const handleRedo = async () => {
        if (canRedo) {
            await redo();
            // Вызываем функцию обновления
            refreshTask();
        }
    };

    return (
        <div className="flex items-center space-x-2 mb-4">
            <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="flex items-center"
            >
                <Undo2 className="h-4 w-4 mr-1" />
                Отменить
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className="flex items-center"
            >
                <Redo2 className="h-4 w-4 mr-1" />
                Повторить
            </Button>
        </div>
    );
}
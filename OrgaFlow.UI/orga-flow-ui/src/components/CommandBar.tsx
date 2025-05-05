import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import { useCommandInvoker } from '@/lib/hooks/useCommandInvoker';

export function CommandBar() {
    const { undo, redo, canUndo, canRedo } = useCommandInvoker();

    return (
        <div className="flex items-center space-x-2 mb-4">
            <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="flex items-center"
            >
                <Undo2 className="h-4 w-4 mr-1" />
                Отменить
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="flex items-center"
            >
                <Redo2 className="h-4 w-4 mr-1" />
                Повторить
            </Button>
        </div>
    );
}
"use client";

import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import { useCommandInvoker } from '@/lib/hooks/useCommandInvoker';

export const TaskRefreshContext = React.createContext(() => {});

export function CommandBar() {
    const { undo, redo, canUndo, canRedo, loading } = useCommandInvoker();
    const refreshTask = useContext(TaskRefreshContext);

    const handleUndo = async () => {
        if (canUndo && !loading) {
            const success = await undo();
            if (success) {
                refreshTask();
            }
        }
    };

    const handleRedo = async () => {
        if (canRedo && !loading) {
            const success = await redo();
            if (success) {
                refreshTask();
            }
        }
    };

    return (
        <div className="flex items-center space-x-2 mb-4">
            <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo || loading}
                className="flex items-center"
            >
                <Undo2 className="h-4 w-4 mr-1" />
                {loading ? "Выполняется..." : "Отменить"}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo || loading}
                className="flex items-center"
            >
                <Redo2 className="h-4 w-4 mr-1" />
                {loading ? "Выполняется..." : "Повторить"}
            </Button>
        </div>
    );
}
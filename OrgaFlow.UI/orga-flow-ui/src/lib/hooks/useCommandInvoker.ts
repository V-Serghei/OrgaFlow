// lib/hooks/useCommandInvoker.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export function useCommandInvoker() {
    const { toast } = useToast();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [loading, setLoading] = useState(false);

    // Функция для получения состояния команд с сервера
    const refreshCommandState = useCallback(async () => {
        try {
            const response = await api.get('/commands/state');
            setCanUndo(response.data.canUndo);
            setCanRedo(response.data.canRedo);
        } catch (error) {
            console.error('Ошибка при получении состояния команд:', error);
        }
    }, []);

    // Загружаем состояние при монтировании компонента
    useEffect(() => {
        refreshCommandState();
    }, [refreshCommandState]);

    // Выполнение команды через API - ИСПРАВЛЕНО
    const executeCommand = async (command) => {
        setLoading(true);
        try {
            // Вместо проверки типов команды, просто вызываем ее метод execute
            // Это избавляет от необходимости импортировать классы команд
            const result = await command.execute();

            // Обновляем состояние команд после выполнения
            await refreshCommandState();

            return result;
        } catch (error) {
            toast({
                title: "Ошибка выполнения команды",
                description: error.message || "Произошла ошибка",
                variant: "destructive",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Отмена команды
    const undo = async () => {
        setLoading(true);
        try {
            const response = await api.post('/undo');
            const success = response.status === 200;

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

            await refreshCommandState();
            return success;
        } catch (error) {
            toast({
                title: "Ошибка отмены команды",
                description: error.message || "Произошла ошибка",
                variant: "destructive",
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Повтор команды
    const redo = async () => {
        setLoading(true);
        try {
            const response = await api.post('/redo');
            const success = response.status === 200;

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

            await refreshCommandState();
            return success;
        } catch (error) {
            toast({
                title: "Ошибка повтора команды",
                description: error.message || "Произошла ошибка",
                variant: "destructive",
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        executeCommand,
        undo,
        redo,
        canUndo,
        canRedo,
        loading,
        refreshCommandState
    };
}
    "use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskTable } from "@/components/task-table";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CommandBar } from "@/components/CommandBar";

export default function TasksPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const response = await api.get("/", {
                    params: {
                        status: statusFilter !== "all" ? statusFilter : undefined,
                        sortBy,
                        sortOrder,
                    },
                });
                setTasks(response.data);
            } catch (error) {
                console.error("Ошибка загрузки задач:", error);
                toast({
                    title: "Ошибка",
                    description: "Не удалось загрузить задачи.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [statusFilter, sortBy, sortOrder, toast]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleEditTask = (task: any) => {
        router.push(`task/${task.id}/edit`);
    };

    const handleDeleteTask = () => {
        // Обновляем список задач после удаления
        const fetchTasks = async () => {
            try {
                const response = await api.get("/", {
                    params: {
                        status: statusFilter !== "all" ? statusFilter : undefined,
                        sortBy,
                        sortOrder,
                    },
                });
                setTasks(response.data);
            } catch (error) {
                console.error("Ошибка обновления задач:", error);
                toast({
                    title: "Ошибка",
                    description: "Не удалось обновить список задач.",
                    variant: "destructive",
                });
            }
        };
        fetchTasks();
    };

    const filteredTasks = tasks.filter((task) =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Задачи</h1>
                <CommandBar />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список задач</CardTitle>
                    <CardDescription>Управляйте своими задачами и просматривайте их статус</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {/* Фильтры и поиск */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Поиск задач..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="pl-8"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Фильтр по статусу" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все статусы</SelectItem>
                                        <SelectItem value="0">К выполнению</SelectItem>
                                        <SelectItem value="2">В процессе</SelectItem>
                                        <SelectItem value="1">Завершено</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Сортировать по" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt">Дата создания</SelectItem>
                                        <SelectItem value="name">Название</SelectItem>
                                        <SelectItem value="importance">Приоритет</SelectItem>
                                        <SelectItem value="endDate">Дата окончания</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={sortOrder} onValueChange={setSortOrder}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Порядок" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="asc">По возрастанию</SelectItem>
                                        <SelectItem value="desc">По убыванию</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Кнопка создания задачи */}
                        <div className="flex justify-end">
                            <Button onClick={() => router.push("/tasks/new")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Создать задачу
                            </Button>
                        </div>

                        {/* Вкладки для фильтрации */}
                        <Tabs defaultValue="all" onValueChange={setStatusFilter}>
                            <TabsList>
                                <TabsTrigger value="all">Все</TabsTrigger>
                                <TabsTrigger value="0">К выполнению</TabsTrigger>
                                <TabsTrigger value="2">В процессе</TabsTrigger>
                                <TabsTrigger value="1">Завершено</TabsTrigger>
                            </TabsList>
                            <TabsContent value={statusFilter}>
                                <TaskTable
                                    tasks={filteredTasks}
                                    onEdit={handleEditTask}
                                    onDelete={handleDeleteTask}
                                    isLoading={isLoading}
                                    searchTerm={searchTerm}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
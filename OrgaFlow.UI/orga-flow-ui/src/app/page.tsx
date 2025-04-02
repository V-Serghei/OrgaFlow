"use client"

import { useState, useEffect } from "react"
import { TaskForm } from "@/components/task-form"
import { TaskTable } from "@/components/task-table"
import api from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import type { Task } from "@/types/task"

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [editingTask, setEditingTask] = useState<Task | null>(null)



    const fetchTasks = async () => {
        try {
            const response = await api.get("/")
            setTasks(response.data)
        } catch (error) {
            console.error("Error loading tasks:", error)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    const handleSave = () => {
        setEditingTask(null)
        fetchTasks()
    }

    const handleEdit = (task) => {
        setEditingTask(task)
    }

    return (
        <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Manage your tasks and track your progress</p>
    </div>
    </div>

    <Tabs defaultValue="overview" className="space-y-4">
    <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="text-2xl font-bold">{tasks.length}</div>
        <p className="text-xs text-muted-foreground">+2 since last week</p>
    </CardContent>
    </Card>
    <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="text-2xl font-bold">{tasks.filter((task) => !task.status).length}</div>
        <p className="text-xs text-muted-foreground">-1 since last week</p>
    </CardContent>
    </Card>
    <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Completed</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="text-2xl font-bold">{tasks.filter((task) => task.status).length}</div>
        <p className="text-xs text-muted-foreground">+3 since last week</p>
    </CardContent>
    </Card>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
    <Card className="col-span-4">
        <CardHeader>
            <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
        <Overview />
        </CardContent>
        </Card>
        <Card className="col-span-3">
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
    <CardDescription>You had 12 tasks this month</CardDescription>
    </CardHeader>
    <CardContent>
    <RecentActivity />
    </CardContent>
    </Card>
    </div>
    </TabsContent>
    <TabsContent value="tasks" className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>Create Task</CardTitle>
    <CardDescription>Add a new task or edit an existing one</CardDescription>
    </CardHeader>
    <CardContent>
    <TaskForm task={editingTask} onSave={handleSave} />
    </CardContent>
    </Card>
    <Card>
    <CardHeader>
        <CardTitle>Task List</CardTitle>
    <CardDescription>Manage and organize your tasks</CardDescription>
    </CardHeader>
    <CardContent>
    <TaskTable tasks={tasks} onEdit={handleEdit} onDelete={fetchTasks} />
    </CardContent>
    </Card>
    </TabsContent>
    </Tabs>
    </div>
)
}


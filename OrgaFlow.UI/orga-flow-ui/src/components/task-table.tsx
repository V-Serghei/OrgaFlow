"use client"

import { useState } from "react"
import { Edit, Trash2, Bell, MoreHorizontal, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import apiNotify from "@/lib/api-notify"
import Link from "next/link"

export function TaskTable({ tasks, onEdit, onDelete }) {
    const { toast } = useToast()
    const [deleteId, setDeleteId] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleSubscribe = async (task) => {
        try {
            await apiNotify.post("/subscribe", task)
            toast({
                title: "Notification Subscribed",
                description: "You will receive notifications for this task.",
            })
        } catch (error) {
            console.error("Error subscribing to notifications:", error)
            toast({
                title: "Subscription Failed",
                description: "Could not subscribe to notifications.",
                variant: "destructive",
            })
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        try {
            await api.delete(`/${deleteId}`)
            toast({
                title: "Task Deleted",
                description: "The task has been successfully deleted.",
            })
            onDelete()
        } catch (error) {
            console.error("Error deleting task:", error)
            toast({
                title: "Deletion Failed",
                description: "Could not delete the task.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    if (!tasks.length) {
        return (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No tasks found</p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id} className="group">
                                <TableCell className="font-medium">{task.id}</TableCell>
                                <TableCell>
                                    <Link href={`/task/${task.id}`} className="hover:underline">
                                        {task.name}
                                    </Link>
                                </TableCell>
                                <TableCell className="hidden max-w-[300px] truncate md:table-cell">
                                    {task.description || "No description"}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <Badge variant={task.completed ? "success" : "default"}>
                                        {task.completed ? "Completed" : "In Progress"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/task/${task.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(task)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSubscribe(task)}>
                                                <Bell className="mr-2 h-4 w-4" />
                                                Notify
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => setDeleteId(task.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}


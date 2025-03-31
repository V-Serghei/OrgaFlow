"use client"

import { CheckCircle2, Clock, XCircle } from "lucide-react"

const activities = [
    {
        id: 1,
        type: "completed",
        task: "Website Redesign",
        time: "2 hours ago",
    },
    {
        id: 2,
        type: "created",
        task: "Client Meeting Preparation",
        time: "5 hours ago",
    },
    {
        id: 3,
        type: "failed",
        task: "API Integration",
        time: "Yesterday",
    },
    {
        id: 4,
        type: "completed",
        task: "Documentation Update",
        time: "Yesterday",
    },
    {
        id: 5,
        type: "created",
        task: "Quarterly Report",
        time: "2 days ago",
    },
]

export function RecentActivity() {
    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                    <div className="rounded-full p-2">
                        {activity.type === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {activity.type === "created" && <Clock className="h-5 w-5 text-blue-500" />}
                        {activity.type === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.task}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}


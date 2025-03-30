"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
    {
        name: "Jan",
        total: 12,
    },
    {
        name: "Feb",
        total: 18,
    },
    {
        name: "Mar",
        total: 5,
    },
    {
        name: "Apr",
        total: 9,
    },
    {
        name: "May",
        total: 14,
    },
    {
        name: "Jun",
        total: 7,
    },
    {
        name: "Jul",
        total: 11,
    },
    {
        name: "Aug",
        total: 16,
    },
    {
        name: "Sep",
        total: 8,
    },
    {
        name: "Oct",
        total: 13,
    },
    {
        name: "Nov",
        total: 9,
    },
    {
        name: "Dec",
        total: 15,
    },
]

export function Overview() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                    cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                    contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
        </ResponsiveContainer>
    )
}


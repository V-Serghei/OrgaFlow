import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
    return new ImageResponse(
        <div
            style={{
        fontSize: 24,
            background: "transparent",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0091FF",
    }}
>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    fill="none"
    />
    <path
        d="M7 16C7 16 10 10 16 10C22 10 25 16 25 16C25 16 22 22 16 22C10 22 7 16 7 16Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    fill="none"
    />
    <path
        d="M16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19Z"
    fill="currentColor"
    />
    <path
        d="M6 8L10 12M26 8L22 12M6 24L10 20M26 24L22 20"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
        />
        </svg>
        </div>,
    {
        width: 32,
            height: 32,
    },
)
}


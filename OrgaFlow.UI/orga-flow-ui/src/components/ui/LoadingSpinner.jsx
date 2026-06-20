"use client";

export function LoadingSpinner({ size = "md", className = "" }) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-10 w-10"
    };

    return (
        <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${className}`} />
    );
}
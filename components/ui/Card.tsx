import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ReactNode } from "react";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps {
    children: ReactNode;
    className?: string;
    glass?: boolean;
}

export function Card({ children, className, glass = false }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl p-4 transition-all duration-200",
                glass
                    ? "glass-panel shadow-lg"
                    : "bg-background-paper border border-white/5 shadow-md",
                className
            )}
        >
            {children}
        </div>
    );
}

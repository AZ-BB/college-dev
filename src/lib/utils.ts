import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export function formatFullName(firstName: string, lastName: string) {
    return `${firstName?.charAt(0).toUpperCase() + firstName?.slice(1)} ${lastName?.charAt(0).toUpperCase() + lastName?.slice(1)}`;
}
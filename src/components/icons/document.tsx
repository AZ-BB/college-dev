import { cn } from "@/lib/utils";

export default function DocumentIcon({className}: {className?: string}) {
    return (
        <svg className={cn('stroke-[#F7670E]', className)} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5013 18.3346H12.5013C16.668 18.3346 18.3346 16.668 18.3346 12.5013V7.5013C18.3346 3.33464 16.668 1.66797 12.5013 1.66797H7.5013C3.33464 1.66797 1.66797 3.33464 1.66797 7.5013V12.5013C1.66797 16.668 3.33464 18.3346 7.5013 18.3346Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.125 7.5H6.875" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.125 12.5H6.875" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
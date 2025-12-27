import { cn } from "@/lib/utils";

export default function CommentIcon({className}: {className?: string}) {
    return (
        <svg className={cn('stroke-[#F7670E]', className)} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.08464 15.8346H6.66797C3.33464 15.8346 1.66797 15.0013 1.66797 10.8346V6.66797C1.66797 3.33464 3.33464 1.66797 6.66797 1.66797H13.3346C16.668 1.66797 18.3346 3.33464 18.3346 6.66797V10.8346C18.3346 14.168 16.668 15.8346 13.3346 15.8346H12.918C12.6596 15.8346 12.4096 15.9596 12.2513 16.168L11.0013 17.8346C10.4513 18.568 9.5513 18.568 9.0013 17.8346L7.7513 16.168C7.61797 15.9846 7.30964 15.8346 7.08464 15.8346Z" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.83203 6.66797H14.1654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.83203 10.832H10.832" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
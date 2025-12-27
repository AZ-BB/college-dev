import { cn } from "@/lib/utils";

export default function PollIcon({className}: {className?: string}) {
    return (
        <svg className={cn('stroke-[#F7670E]', className)} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.66797 18.332H18.3346" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.125 3.33464V18.3346H11.875V3.33464C11.875 2.41797 11.5 1.66797 10.375 1.66797H9.625C8.5 1.66797 8.125 2.41797 8.125 3.33464Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.5 8.33464V18.3346H5.83333V8.33464C5.83333 7.41797 5.5 6.66797 4.5 6.66797H3.83333C2.83333 6.66797 2.5 7.41797 2.5 8.33464Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.168 12.4987V18.332H17.5013V12.4987C17.5013 11.582 17.168 10.832 16.168 10.832H15.5013C14.5013 10.832 14.168 11.582 14.168 12.4987Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
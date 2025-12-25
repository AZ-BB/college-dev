import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContributionHeatmap from "./_components/ContributionHeatmap";

export default function Profile() {
    return (
        <div className="w-full pt-6">
            <ContributionHeatmap />

            <div className="items-center gap-4 mt-5 hidden sm:flex">
                <div className="flex items-center gap-2">
                    <div className="w-[32px] h-[32px] bg-[#FEF0E7] rounded-[4px] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.23242 15.2916L8.81576 17.2916C9.14909 17.6249 9.89909 17.7916 10.3991 17.7916H13.5658C14.5658 17.7916 15.6491 17.0416 15.8991 16.0416L17.8991 9.95823C18.3158 8.79156 17.5658 7.79156 16.3158 7.79156H12.9824C12.4824 7.79156 12.0658 7.37489 12.1491 6.79156L12.5658 4.12489C12.7324 3.37489 12.2324 2.54156 11.4824 2.29156C10.8158 2.04156 9.98242 2.37489 9.64909 2.87489L6.23242 7.95823" stroke="#F7670E" strokeWidth="1.5" strokeMiterlimit="10" />
                            <path d="M1.98242 15.2915V7.12484C1.98242 5.95817 2.48242 5.5415 3.64909 5.5415H4.48242C5.64909 5.5415 6.14909 5.95817 6.14909 7.12484V15.2915C6.14909 16.4582 5.64909 16.8748 4.48242 16.8748H3.64909C2.48242 16.8748 1.98242 16.4582 1.98242 15.2915Z" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <div className="space-x-2">
                        <span className="text-lg font-semibold text-[#0F172A] font-generalSans">89</span>
                        <span className="text-lg font-normal text-[#485057] font-generalSans">Likes</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-[32px] h-[32px] bg-[#FEF0E7] rounded-[4px] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.49935 18.3332H12.4993C16.666 18.3332 18.3327 16.6665 18.3327 12.4998V7.49984C18.3327 3.33317 16.666 1.6665 12.4993 1.6665H7.49935C3.33268 1.6665 1.66602 3.33317 1.66602 7.49984V12.4998C1.66602 16.6665 3.33268 18.3332 7.49935 18.3332Z" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13.125 7.5H6.875" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13.125 12.5H6.875" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <div className="space-x-2">
                        <span className="text-lg font-semibold text-[#0F172A] font-generalSans">89</span>
                        <span className="text-lg font-normal text-[#485057] font-generalSans">Posts</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-[32px] h-[32px] bg-[#FEF0E7] rounded-[4px] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.08268 15.8332H6.66602C3.33268 15.8332 1.66602 14.9998 1.66602 10.8332V6.6665C1.66602 3.33317 3.33268 1.6665 6.66602 1.6665H13.3327C16.666 1.6665 18.3327 3.33317 18.3327 6.6665V10.8332C18.3327 14.1665 16.666 15.8332 13.3327 15.8332H12.916C12.6577 15.8332 12.4077 15.9582 12.2493 16.1665L10.9993 17.8332C10.4493 18.5665 9.54935 18.5665 8.99935 17.8332L7.74935 16.1665C7.61602 15.9832 7.30768 15.8332 7.08268 15.8332Z" stroke="#F7670E" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5.83398 6.6665H14.1673" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5.83398 10.8335H10.834" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <div className="space-x-2">
                        <span className="text-lg font-semibold text-[#0F172A] font-generalSans">89</span>
                        <span className="text-lg font-normal text-[#485057] font-generalSans">Comments</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-[32px] h-[32px] bg-[#FEF0E7] rounded-[4px] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.66602 18.3335H18.3327" stroke="#F7670E" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8.125 3.33317V18.3332H11.875V3.33317C11.875 2.4165 11.5 1.6665 10.375 1.6665H9.625C8.5 1.6665 8.125 2.4165 8.125 3.33317Z" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2.5 8.33317V18.3332H5.83333V8.33317C5.83333 7.4165 5.5 6.6665 4.5 6.6665H3.83333C2.83333 6.6665 2.5 7.4165 2.5 8.33317Z" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14.166 12.5002V18.3335H17.4993V12.5002C17.4993 11.5835 17.166 10.8335 16.166 10.8335H15.4993C14.4993 10.8335 14.166 11.5835 14.166 12.5002Z" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <div className="space-x-2">
                        <span className="text-lg font-semibold text-[#0F172A] font-generalSans">89</span>
                        <span className="text-lg font-normal text-[#485057] font-generalSans">Poll Votes</span>
                    </div>
                </div>

            </div>
        </div>
    )
}

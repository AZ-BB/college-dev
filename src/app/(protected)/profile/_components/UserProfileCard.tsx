import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function UserProfileCard() {
    return (
        <div className="w-full shadow-md p-6 rounded-3xl flex flex-col gap-5">
            <div>
                <Avatar className="w-28 h-28 rounded-2xl">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>

            <div className="w-full space-y-2">
                <h1 className="text-2xl font-bold">John Doe</h1>
                <p className="text-base text-[#65707A] font-semibold tracking-wide">john@example.com</p>
                {/* Max ~50 words */}
                <p className="text-base text-[#65707A] font-medium w-full">
                    Hello, I’m john smith from USA. I’m interested in technology and AI that.
                </p>
            </div>

            <Badge className="bg-[#E8FDF3] flex items-center gap-2 py-1">
                <div className="w-3 h-3 rounded-full bg-[#0DA55E]" />
                <p className="text-sm text-[#0DA55E] font-semibold tracking-wide">Online now</p>
            </Badge>

            <div className="w-full flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1.5V3.75" stroke="#65707A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M12 1.5V3.75" stroke="#65707A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M2.625 6.81738H15.375" stroke="#65707A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M15.75 6.375V12.75C15.75 15 14.625 16.5 12 16.5H6C3.375 16.5 2.25 15 2.25 12.75V6.375C2.25 4.125 3.375 2.625 6 2.625H12C14.625 2.625 15.75 4.125 15.75 6.375Z" stroke="#65707A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M11.7713 10.2749H11.778" stroke="#65707A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M11.7713 12.5249H11.778" stroke="#65707A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M8.99588 10.2749H9.00262" stroke="#65707A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M8.99588 12.5249H9.00262" stroke="#65707A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M6.22049 10.2749H6.22723" stroke="#65707A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M6.22049 12.5249H6.22723" stroke="#65707A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

                <p className="text-sm text-[#65707A] font-medium">joined Nov 15, 2025</p>
            </div>

            <div className="flex items-center gap-2 justify-start">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight">156</span>
                    <span className="text-sm text-[#65707A] font-medium">Contributions</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight">60</span>
                    <span className="text-sm text-[#65707A] font-medium">Followers</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight">23</span>
                    <span className="text-sm text-[#65707A] font-medium">Following</span>
                </div>
            </div>

            <div className="w-full flex items-center gap-3 justify-start py-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.9902 17.5H16.5002C19.5202 17.5 22.0002 15.03 22.0002 12C22.0002 8.98 19.5302 6.5 16.5002 6.5H14.9902" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M9 6.5H7.5C4.47 6.5 2 8.97 2 12C2 15.02 4.47 17.5 7.5 17.5H9" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M8 12H16" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M17.6361 7H17.6477" stroke="#292D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_32678_3925" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
                        <path d="M0 0H20V20H0V0Z" fill="white" />
                    </mask>
                    <g mask="url(#mask0_32678_3925)">
                        <path d="M15.75 0.937012H18.8171L12.1171 8.61415L20 19.0627H13.8286L8.99143 12.727L3.46286 19.0627H0.392857L7.55857 10.8484L0 0.93844H6.32857L10.6943 6.72844L15.75 0.937012ZM14.6714 17.2227H16.3714L5.4 2.6813H3.57714L14.6714 17.2227Z" fill="black" />
                    </g>
                </svg>

                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 2H14C12.6739 2 11.4021 2.52678 10.4645 3.46447C9.52678 4.40215 9 5.67392 9 7V10H6V14H9V22H13V14H16L17 10H13V7C13 6.73478 13.1054 6.48043 13.2929 6.29289C13.4804 6.10536 13.7348 6 14 6H17V2Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

            </div>

            <div className="w-full flex flex-col gap-2">
                <Button variant="default" className="w-full bg-[#F7670E] text-white py-6 font-semibold text-base hover:bg-[#F7670E]/90">
                    Follow
                </Button>

                <Button variant="default" className="w-full py-6 font-semibold text-base">
                    Chat
                </Button>
            </div>
        </div>
    )
}
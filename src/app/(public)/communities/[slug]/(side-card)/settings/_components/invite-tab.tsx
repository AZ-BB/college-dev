"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommunityRole } from "@/enums/enums";
import { inviteMemberByEmail } from "@/action/members";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteTabProps {
    communityId: number;
    slug: string;
}

export function InviteTab({ communityId, slug }: InviteTabProps) {
    const [role, setRole] = useState<CommunityRole>(CommunityRole.MEMBER);
    const [email, setEmail] = useState<string>("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite/${slug}`;

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setSubmitError("Failed to copy link");
        }
    }

    function validateEmail(value: string): boolean {
        const trimmed = value.trim().toLowerCase();
        if (!trimmed) {
            setEmailError("Email is required");
            return false;
        }
        if (!EMAIL_REGEX.test(trimmed)) {
            setEmailError("Please enter a valid email address");
            return false;
        }
        setEmailError(null);
        return true;
    }

    function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setEmail(value);
        setSubmitError(null);
        setSubmitSuccess(null);
        if (emailError) validateEmail(value);
    }

    async function handleSendInvite() {
        setSubmitError(null);
        setSubmitSuccess(null);
        if (!validateEmail(email)) return;

        setLoading(true);
        const result = await inviteMemberByEmail(communityId, slug, email.trim().toLowerCase(), role);
        setLoading(false);

        if (result.error || result.statusCode !== 200) {
            setSubmitError(result.message ?? result.error ?? "Failed to send invitation");
            return;
        }

        setSubmitSuccess(result.message ?? "Invitation sent successfully");
        setEmail("");
        setEmailError(null);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                    readOnly
                    value={inviteLink}
                    className="rounded-lg bg-grey-200 py-5 sm:py-6 text-base sm:text-sm flex-1 min-w-0"
                />
                <Button
                    variant="secondary"
                    className="rounded-lg py-5 sm:py-6 text-base sm:text-sm shrink-0"
                    onClick={handleCopyLink}
                >
                    {copied ? "Copied!" : "Copy Link"}
                </Button>
            </div>

            <div className="flex gap-2 justify-between items-center border border-grey-200 rounded-lg p-4">
                <div className="text-base sm:text-sm font-semibold text-grey-900">
                    Or Invite Via Socials
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Single Invite */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <label className="text-base sm:text-sm font-medium text-grey-900">Invite as</label>
                    <Select value={role} onValueChange={(value) => setRole(value as CommunityRole)}>
                        <SelectTrigger variant="secondary" className="w-full max-w-[140px] font-semibold rounded-lg text-base sm:text-sm h-10">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={CommunityRole.MEMBER}>Member</SelectItem>
                            <SelectItem value={CommunityRole.ADMIN}>Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="invite-email" className="text-base sm:text-sm font-medium text-grey-900">
                        Email Address
                    </label>
                    <Input
                        id="invite-email"
                        type="email"
                        placeholder="email@address.com"
                        className={`rounded-lg bg-grey-200 py-5 sm:py-6 text-base sm:text-sm ${emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={() => email && validateEmail(email)}
                        disabled={loading}
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? "email-error" : undefined}
                    />
                    <Button
                        variant="default"
                        className="rounded-lg py-5 sm:py-6 text-base sm:text-sm w-full sm:w-fit bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                        onClick={handleSendInvite}
                        disabled={loading}
                    >
                        {loading ? "Sending…" : "Invite"}
                    </Button>
                </div>
                <p className="text-base sm:text-sm text-grey-600">
                    Invites grant instant access for free communities without purchasing or requesting membership. For earning communities, members must pay your subscription to join, not applicable for admins.
                </p>
                {emailError && (
                    <p id="email-error" className="text-base sm:text-sm text-destructive">
                        {emailError}
                    </p>
                )}
                {submitError && (
                    <p className="text-base sm:text-sm text-destructive">
                        {submitError}
                    </p>
                )}
                {submitSuccess && (
                    <p className="text-base sm:text-sm text-green-600">
                        {submitSuccess}
                    </p>
                )}
            </div>

            <Separator className="opacity-50" />

            {/* Bulk Invite */}
            <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg p-3 bg-orange-50 border border-orange-200 shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500" aria-hidden>
                            <path d="M10.294 15.016C10.248 14.024 9.571 14 8.651 14C7.235 14 7 14.338 7 15.667V17.333C7 18.662 7.235 19 8.651 19C9.571 19 10.249 18.976 10.294 17.984M21 14L19.537 17.912C19.265 18.637 19.13 19 18.915 19C18.7 19 18.565 18.637 18.293 17.912L16.83 14M14.721 14H13.749C13.36 14 13.166 14 13.013 14.063C12.491 14.279 12.498 14.787 12.498 15.25C12.498 15.713 12.491 16.22 13.013 16.437C13.166 16.5 13.36 16.5 13.749 16.5C14.137 16.5 14.332 16.5 14.485 16.563C15.007 16.779 15 17.287 15 17.75C15 18.213 15.007 18.72 14.485 18.937C14.332 19 14.137 19 13.749 19H12.689" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M19 11C19 10 19 9.43 18.848 9.063C18.696 8.696 18.407 8.406 17.828 7.828L13.092 3.092C12.593 2.593 12.344 2.344 12.034 2.196C11.9698 2.16518 11.9041 2.13781 11.837 2.114C11.514 2 11.161 2 10.456 2C7.211 2 5.588 2 4.489 2.886C4.26709 3.06494 4.06494 3.26709 3.886 3.489C3 4.59 3 6.211 3 9.456V14C3 17.771 3 19.657 4.172 20.828C5.344 21.999 7.229 22 11 22H19M12 2.5V3C12 5.828 12 7.243 12.879 8.121C13.757 9 15.172 9 18 9H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-sm font-bold text-grey-900">Bulk Invite</p>
                        <p className="text-base sm:text-sm text-grey-600 mt-1">
                            Invite multiple members at once by uploading a .CSV file with their email addresses
                        </p>
                    </div>
                </div>
                <Button
                    variant="secondary"
                    className="rounded-lg py-5 sm:py-6 text-base sm:text-sm w-full sm:w-fit bg-grey-200 hover:bg-grey-300 text-grey-900 font-semibold"
                    disabled
                >
                    Upload .csv
                </Button>
            </div>
        </div>
    );
}
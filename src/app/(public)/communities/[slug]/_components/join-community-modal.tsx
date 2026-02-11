"use client";

import { joinCommunity } from "@/action/members";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import { Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type QuestionType = "TEXT" | "EMAIL" | "MULTIPLE_CHOICE";
const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
    TEXT: "Text",
    EMAIL: "Email",
    MULTIPLE_CHOICE: "Multiple Choice",
};

type Pricing = "FREE" | "SUB" | "ONE_TIME";
type BillingCycle = "MONTHLY" | "YEARLY" | "MONTHLY_YEARLY" | null;

function getQuestionDisplay(q: Tables<"community_questions">) {
    if (q.type === "MULTIPLE_CHOICE") {
        try {
            const parsed = JSON.parse(q.content) as { question?: string; options?: string[] };
            return { text: parsed.question ?? q.content, options: parsed.options ?? [] };
        } catch {
            return { text: q.content, options: [] };
        }
    }
    return { text: q.content, options: [] };
}

function formatPlan(
    pricing: Pricing,
    amountPerMonth: number | null,
    amountPerYear: number | null,
    amountOneTime: number | null,
    billingCycle: BillingCycle
): string {
    if (pricing === "FREE") return "Free";
    if (pricing === "ONE_TIME" && amountOneTime != null) return `₹${amountOneTime} one-time`;
    if (pricing === "SUB") {
        if (billingCycle === "YEARLY" && amountPerYear != null) return `₹${amountPerYear}/year`;
        if (amountPerMonth != null) return `₹${amountPerMonth}/month`;
        if (amountPerYear != null) return `₹${amountPerYear}/year`;
        return "Subscription";
    }
    return "Paid";
}

export default function JoinCommunityModal({
    communityName,
    questions,
    communityId,
    slug,
    isPublic,
    isFree,
    pricing,
    amountPerMonth,
    amountPerYear,
    amountOneTime,
    billingCycle,
}: {
    questions: Tables<"community_questions">[];
    communityId: number;
    communityName: string;
    slug: string;
    isPublic: boolean;
    isFree: boolean;
    pricing: Pricing;
    amountPerMonth: number | null;
    amountPerYear: number | null;
    amountOneTime: number | null;
    billingCycle: BillingCycle;
}) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState<"questions" | "payment" | "success">("questions");
    const [membershipStatus, setMembershipStatus] = useState<"ACTIVE" | "PENDING">("ACTIVE");
    const [joining, setJoining] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
    const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
    const sortedQuestions = [...questions].sort((a, b) => a.index - b.index);
    const isPaid = !isFree;
    const hasQuestions = sortedQuestions.length > 0;
    const isPrivate = !isPublic;

    const setAnswer = useCallback((questionId: number, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }, []);

    const toggleMcqAnswer = useCallback((questionId: number, optionId: string) => {
        setAnswers((prev) => {
            const current = prev[questionId];
            const currentArray = Array.isArray(current) ? current : current ? [current] : [];
            const isSelected = currentArray.includes(optionId);
            const newArray = isSelected
                ? currentArray.filter((id) => id !== optionId)
                : [...currentArray, optionId];
            return { ...prev, [questionId]: newArray };
        });
    }, []);

    const allAnswered = sortedQuestions.every((q) => {
        const v = answers[q.id];
        if (q.type === "MULTIPLE_CHOICE") {
            return Array.isArray(v) && v.length > 0;
        }
        return typeof v === "string" && v.trim().length > 0;
    });

    // Determine expected membership status based on community type
    const getExpectedStatus = useCallback((): "ACTIVE" | "PENDING" => {
        if (isPrivate && isFree) {
            // PRIVATE FREE: always PENDING
            return "PENDING";
        } else if (isPrivate && isPaid) {
            // PRIVATE PAID: ACTIVE after payment
            return "ACTIVE";
        } else if (isPublic && isPaid) {
            // PUBLIC PAID: ACTIVE after payment
            return "ACTIVE";
        } else {
            // PUBLIC FREE: PENDING if questions, ACTIVE if no questions
            return hasQuestions ? "PENDING" : "ACTIVE";
        }
    }, [isPrivate, isPublic, isFree, isPaid, hasQuestions]);

    const resetAndOpen = useCallback(async () => {
        setAnswers({});
        
        // For free communities without questions, call action immediately
        if (isFree && !hasQuestions) {
            setJoining(true);
            const res = await joinCommunity(communityId, slug, {});
            setJoining(false);
            if (res.error) {
                toast.error(res.message ?? res.error);
                return;
            }
            setMembershipStatus(getExpectedStatus());
            setModalStep("success");
            setModalOpen(true);
            router.refresh();
            return;
        }

        // Otherwise, open modal at appropriate step
        // Only show payment step for paid communities (not free)
        if (!isFree) {
            setModalStep(hasQuestions ? "questions" : "payment");
        } else {
            setModalStep("questions");
        }
        setModalOpen(true);
    }, [isFree, isPaid, hasQuestions, communityId, slug, getExpectedStatus, router]);

    const handleShare = useCallback(() => {
        const link = `${window.location.origin}/communities/${slug}`;
        navigator.clipboard
            .writeText(link)
            .then(() => toast.success("Community link copied to clipboard"))
            .catch(() => toast.error("Failed to copy link"));
    }, [slug]);

    // Prepare answers for server: convert MCQ arrays to JSON strings
    const prepareAnswersForServer = useCallback(() => {
        const prepared: Record<number, string> = {};
        sortedQuestions.forEach((q) => {
            const answer = answers[q.id];
            if (q.type === "MULTIPLE_CHOICE" && Array.isArray(answer)) {
                prepared[q.id] = JSON.stringify(answer);
            } else if (typeof answer === "string") {
                prepared[q.id] = answer;
            }
        });
        return prepared;
    }, [answers, sortedQuestions]);

    // Handle questions step completion
    async function handleQuestionsComplete() {
        if (!allAnswered) {
            toast.error("Please answer all questions.");
            return;
        }

        // Only go to payment step if community is actually paid (not free)
        if (!isFree) {
            // For paid communities, go to payment step
            setModalStep("payment");
        } else {
            // For free communities, call action
            setJoining(true);
            const preparedAnswers = prepareAnswersForServer();
            const res = await joinCommunity(communityId, slug, { answers: preparedAnswers });
            setJoining(false);
            if (res.error) {
                toast.error(res.message ?? res.error);
                return;
            }
            setMembershipStatus(getExpectedStatus());
            setModalStep("success");
            router.refresh();
        }
    }

    // Handle payment (for paid communities)
    async function handlePayment() {
        setJoining(true);
        const preparedAnswers = prepareAnswersForServer();
        const res = await joinCommunity(communityId, slug, hasQuestions ? { answers: preparedAnswers } : {});
        setJoining(false);
        if (res.error) {
            toast.error(res.message ?? res.error);
            return;
        }
        setMembershipStatus(getExpectedStatus());
        setModalStep("success");
        router.refresh();
    }

    function handleCloseModal() {
        setModalOpen(false);
        // Reset to initial step after a delay
        setTimeout(() => {
            setModalStep(!isFree ? (hasQuestions ? "questions" : "payment") : "questions");
        }, 300);
    }

    const planLabel = formatPlan(
        pricing,
        amountPerMonth,
        amountPerYear,
        amountOneTime,
        billingCycle
    );

    const getButtonLabel = () => {
        if (isFree) {
            return isPrivate ? "Request to join" : "Join For Free";
        }
        return `Join — ${planLabel}`;
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <Button
                variant="default"
                className="w-full py-7"
                onClick={resetAndOpen}
                disabled={joining}
            >
                {joining ? "Processing..." : getButtonLabel()}
            </Button>

            <Button
                variant="secondary"
                className="w-full py-7"
                onClick={handleShare}
            >
                <Share2 className="w-5 h-5 mr-2" />
                Share
            </Button>

            {/* Unified modal for all join flows */}
            <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-[480px] max-h-[85vh] flex flex-col">
                    {modalStep === "questions" && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {isPaid ? `Join ${communityName}` : isPrivate ? "Request to join" : "Member questions"}
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-grey-600 -mt-1">
                                {isPaid
                                    ? "Answer these questions, then you'll proceed to payment."
                                    : isPrivate
                                      ? "Answer these questions to submit your request."
                                      : "Answer these questions to join."}
                            </p>
                            <div className="overflow-y-auto flex-1 min-h-0 space-y-5 py-2 px-1">
                                {sortedQuestions.map((q) => {
                                    const display = getQuestionDisplay(q);
                                    const answerValue = answers[q.id];
                                    const value = typeof answerValue === "string" ? answerValue : "";

                                    return (
                                        <div key={q.id} className="space-y-3">
                                            <p className="text-sm font-semibold text-grey-900">
                                                {display.text || "Question"}
                                            </p>

                                            {q.type === "TEXT" && (
                                                <Input
                                                    type="text"
                                                    placeholder="Your answer"
                                                    value={value}
                                                    onChange={(e) => setAnswer(q.id, e.target.value)}
                                                    className="rounded-lg bg-white border-grey-300"
                                                />
                                            )}

                                            {q.type === "EMAIL" && (
                                                <Input
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    value={value}
                                                    onChange={(e) => setAnswer(q.id, e.target.value)}
                                                    className="rounded-lg bg-white border-grey-300"
                                                />
                                            )}

                                            {q.type === "MULTIPLE_CHOICE" &&
                                                display.options.length > 0 && (
                                                    <div className="flex flex-col gap-2 pt-1">
                                                        {display.options.map((opt, i) => {
                                                            const optionId = String(i);
                                                            const selectedArray = Array.isArray(answerValue) ? answerValue : [];
                                                            const isSelected = selectedArray.includes(optionId);
                                                            return (
                                                                <label
                                                                    key={i}
                                                                    htmlFor={`q-${q.id}-opt-${i}`}
                                                                    className={cn(
                                                                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors",
                                                                        isSelected
                                                                            ? "border-orange-500 bg-orange-50"
                                                                            : "border-grey-200 bg-white hover:border-grey-300"
                                                                    )}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`q-${q.id}-opt-${i}`}
                                                                        checked={isSelected}
                                                                        onChange={() =>
                                                                            toggleMcqAnswer(q.id, optionId)
                                                                        }
                                                                        className="size-4 border-grey-300 text-orange-500 focus:ring-orange-500 rounded"
                                                                    />
                                                                    <span className="text-sm font-medium text-grey-900">
                                                                        {opt}
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-grey-200">
                                <Button
                                    variant="default"
                                    className="flex-1 rounded-[16px] bg-orange-500 text-sm hover:bg-orange-600 py-6 font-semibold"
                                    onClick={handleQuestionsComplete}
                                    disabled={!allAnswered || joining}
                                >
                                    {joining
                                        ? isPrivate && isFree
                                            ? "Sending…"
                                            : "Processing…"
                                        : isPaid
                                          ? "Continue to payment"
                                          : isPrivate
                                            ? "SEND REQUEST"
                                            : "JOIN COMMUNITY"}
                                </Button>
                            </div>

                            <p className="text-sm text-grey-700 text-center">
                                By joining, you accept {communityName} and <br />
                                The College's{" "}
                                <Link href="/terms" className="text-blue-500 hover:underline">
                                    terms
                                </Link>
                                . You can cancel anytime.
                            </p>
                        </>
                    )}

                    {modalStep === "payment" && !isFree && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Join {communityName}</DialogTitle>
                            </DialogHeader>
                            <div className="overflow-y-auto flex-1 min-h-0 space-y-4 py-2">
                                <div className="rounded-lg border border-grey-200 bg-grey-50/50 p-4 space-y-3">
                                    <p className="text-sm font-semibold text-grey-900">Plan Details</p>
                                    
                                    {pricing === "ONE_TIME" && amountOneTime != null && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-grey-600">One-time payment</p>
                                            <p className="text-2xl font-bold text-grey-900">₹{amountOneTime}</p>
                                        </div>
                                    )}

                                    {pricing === "SUB" && (
                                        <div className="space-y-3">
                                            {billingCycle === "MONTHLY" && amountPerMonth != null && (
                                                <div className="space-y-1">
                                                    <p className="text-xs text-grey-600">Monthly subscription</p>
                                                    <p className="text-2xl font-bold text-grey-900">₹{amountPerMonth}<span className="text-sm font-normal text-grey-600">/month</span></p>
                                                </div>
                                            )}

                                            {billingCycle === "YEARLY" && amountPerYear != null && (
                                                <div className="space-y-1">
                                                    <p className="text-xs text-grey-600">Yearly subscription</p>
                                                    <p className="text-2xl font-bold text-grey-900">₹{amountPerYear}<span className="text-sm font-normal text-grey-600">/year</span></p>
                                                </div>
                                            )}

                                            {billingCycle === "MONTHLY_YEARLY" && (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-grey-600 mb-3">Choose your plan</p>
                                                    
                                                    {amountPerMonth != null && (
                                                        <label
                                                            htmlFor="plan-monthly"
                                                            className={cn(
                                                                "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                                                                selectedPlan === "monthly"
                                                                    ? "border-orange-500 bg-orange-50"
                                                                    : "border-grey-200 bg-white hover:border-grey-300"
                                                            )}
                                                        >
                                                            <input
                                                                type="radio"
                                                                id="plan-monthly"
                                                                name="billing-plan"
                                                                value="monthly"
                                                                checked={selectedPlan === "monthly"}
                                                                onChange={() => setSelectedPlan("monthly")}
                                                                className="size-4 border-grey-300 text-orange-500 focus:ring-orange-500"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-grey-900">Monthly</p>
                                                                <p className="text-xs text-grey-600">Billed monthly</p>
                                                            </div>
                                                            <p className="text-xl font-bold text-grey-900">₹{amountPerMonth}<span className="text-sm font-normal text-grey-600">/mo</span></p>
                                                        </label>
                                                    )}
                                                    
                                                    {amountPerYear != null && (
                                                        <label
                                                            htmlFor="plan-yearly"
                                                            className={cn(
                                                                "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                                                                selectedPlan === "yearly"
                                                                    ? "border-orange-500 bg-orange-50"
                                                                    : "border-grey-200 bg-white hover:border-grey-300"
                                                            )}
                                                        >
                                                            <input
                                                                type="radio"
                                                                id="plan-yearly"
                                                                name="billing-plan"
                                                                value="yearly"
                                                                checked={selectedPlan === "yearly"}
                                                                onChange={() => setSelectedPlan("yearly")}
                                                                className="size-4 border-grey-300 text-orange-500 focus:ring-orange-500"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-grey-900">Yearly</p>
                                                                <p className="text-xs text-grey-600">Billed annually</p>
                                                            </div>
                                                            <p className="text-xl font-bold text-grey-900">₹{amountPerYear}<span className="text-sm font-normal text-grey-600">/yr</span></p>
                                                        </label>
                                                    )}
                                                </div>
                                            )}

                                            {!billingCycle && (
                                                <>
                                                    {amountPerMonth != null && (
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-grey-600">Monthly subscription</p>
                                                            <p className="text-2xl font-bold text-grey-900">₹{amountPerMonth}<span className="text-sm font-normal text-grey-600">/month</span></p>
                                                        </div>
                                                    )}
                                                    {amountPerYear != null && !amountPerMonth && (
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-grey-600">Yearly subscription</p>
                                                            <p className="text-2xl font-bold text-grey-900">₹{amountPerYear}<span className="text-sm font-normal text-grey-600">/year</span></p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="default"
                                    className="w-full rounded-[16px] bg-orange-500 text-sm hover:bg-orange-600 py-6 font-semibold"
                                    onClick={handlePayment}
                                    disabled={joining}
                                >
                                    {joining ? "Processing…" : "Pay"}
                                </Button>
                                <p className="text-xs text-grey-500 text-center">
                                    Payment integration is a placeholder. In production, connect your
                                    payment provider.
                                </p>
                            </div>
                        </>
                    )}

                    {modalStep === "success" && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {membershipStatus === "PENDING"
                                        ? "Your join request has been submitted."
                                        : "Welcome to the community!"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                {membershipStatus === "PENDING" ? (
                                    <p className="text-sm text-grey-600">
                                        The {communityName} admins are reviewing your request. You&apos;ll get
                                        an email when you&apos;re approved.
                                    </p>
                                ) : (
                                    <p className="text-sm text-grey-600">
                                        You&apos;re now a member. Welcome to {communityName}!
                                    </p>
                                )}
                                <Button
                                    variant="default"
                                    className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 py-6 font-semibold"
                                    onClick={handleCloseModal}
                                >
                                    Got It
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

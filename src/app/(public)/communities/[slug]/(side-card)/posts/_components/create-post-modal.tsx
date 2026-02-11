"use client";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UserAvatar from "@/components/user-avatart";
import { cn, formatFullName } from "@/lib/utils";
import { UserData } from "@/utils/get-user-data";
import { Tables } from "@/database.types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusIcon, XIcon } from "lucide-react";
import { isValidVideoUrl, isValidUrl } from "@/utils/validate-video-url";
import VideoEmbed from "@/components/video-embed";
import { createPost, createPostImageAttachments } from "@/action/posts";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserAccess } from "@/contexts/access-context";
import { UserAccess } from "@/enums/enums";
import { TopicWritePermissionType } from "@/enums/enums";

export default function CreatePostModal({ user, topics }: { user: UserData, topics: Tables<"topics">[] }) {
    const router = useRouter();

    const searchParams = useSearchParams();
    const topic = searchParams.get("topic");

    const { userAccess, userId } = useUserAccess();

    if (userAccess === UserAccess.MEMBER &&
        topics.find(t => t.id === parseInt(topic || "0"))?.write_permission_type === TopicWritePermissionType.ADMINS) {
        return null;
    }

    const filteredTopics = userAccess === UserAccess.MEMBER ?
        topics.filter(t => t.write_permission_type === TopicWritePermissionType.PUBLIC) :
        topics;

    const [open, setOpen] = useState<boolean>(false);
    const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
    const [linkModalOpen, setLinkModalOpen] = useState<boolean>(false);

    const [selectedTopic, setSelectedTopic] = useState<number>(topics[0].id);
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");

    const [hasPoll, setHasPoll] = useState<boolean>(false);
    const [hasVideo, setHasVideo] = useState<boolean>(false);

    const [pollOptions, setPollOptions] = useState<{ id: number, name: string }[]>([
        { id: 1, name: "" },
    ]);

    const [linkInput, setLinkInput] = useState<string>("");
    const [linkNameInput, setLinkNameInput] = useState<string>("");
    const [linkInputError, setLinkInputError] = useState<string>("");
    const [links, setLinks] = useState<{ id: number, url: string, name: string }[]>([]);
    const [videoUrl, setVideoUrl] = useState<string>("");

    const [imageData, setImageData] = useState<{ file: File; preview: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleAddPollOption = () => {
        setPollOptions([...pollOptions, { id: pollOptions.length + 1, name: "" }]);
    }

    const handleAddVideo = () => {
        if (!videoUrl.trim()) {
            return;
        }

        if (isValidVideoUrl(videoUrl)) {
            setHasVideo(true);
            setVideoModalOpen(false);
        } else {
            // You could add error state here to show validation message
            alert("Please enter a valid video URL from YouTube, Google Drive, Zoom, Loom, or Vimeo");
        }
    }

    const handleImageSelect = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
            const newImageData = imageFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setImageData(prev => [...prev, ...newImageData]);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleRemoveImage = (index: number) => {
        setImageData(prev => {
            // Revoke the object URL for the removed image before removing
            const itemToRemove = prev[index];
            if (itemToRemove?.preview) {
                URL.revokeObjectURL(itemToRemove.preview);
            }
            // Return filtered array - file and preview stay together
            return prev.filter((_, i) => i !== index);
        });
    }

    const handleSubmit = async () => {
        // Validate required fields
        if (!title.trim()) {
            setError("Please enter a title");
            return;
        }

        if (!content.trim()) {
            setError("Please enter content");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // Prepare poll options if poll exists
            const pollOptionsTexts = hasPoll
                ? pollOptions.map((opt) => opt.name).filter((name) => name.trim().length > 0)
                : undefined;

            // Create the post
            const result = await createPost({
                title: title.trim(),
                content: content.trim(),
                topicId: selectedTopic,
                videoUrl: hasVideo && videoUrl ? videoUrl.trim() : null,
                pollOptions: pollOptionsTexts,
                links: links.length > 0 ? links.map((link) => ({ url: link.url, name: link.name })) : undefined,
            });

            if (result.error) {
                setError(result.error);
                setIsSubmitting(false);
                return;
            }

            const postId = result.data!.postId;

            // Upload images if any
            if (imageData.length > 0) {
                const uploadedAttachments: Array<{ url: string; name: string; path: string }> = [];

                try {
                    // Upload each image
                    for (const imageItem of imageData) {
                        const formData = new FormData();
                        formData.append("file", imageItem.file);
                        formData.append("postId", postId.toString());

                        const uploadResponse = await fetch("/api/post", {
                            method: "POST",
                            body: formData,
                        });

                        if (!uploadResponse.ok) {
                            const errorData = await uploadResponse.json();
                            throw new Error(errorData.error || "Failed to upload image");
                        }

                        const uploadData = await uploadResponse.json();
                        uploadedAttachments.push({
                            url: uploadData.url,
                            name: imageItem.file.name,
                            path: uploadData.path,
                        });
                    }

                    // Create image attachment records
                    if (uploadedAttachments.length > 0) {
                        const attachmentResult = await createPostImageAttachments(postId, uploadedAttachments);
                        if (attachmentResult.error) {
                            // Images are already uploaded, but attachment creation failed
                            // The cleanup will happen in the action
                            setError(attachmentResult.error);
                            setIsSubmitting(false);
                            return;
                        }
                    }
                } catch (uploadError) {
                    console.error("Error uploading images:", uploadError);
                    setError(uploadError instanceof Error ? uploadError.message : "Failed to upload images");
                    setIsSubmitting(false);
                    return;
                }
            }

            // Success - close modal and refresh
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error creating post:", error);
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (!hasPoll) {
            setPollOptions([{ id: 1, name: "" }]);
        }
    }, [hasPoll]);

    // Cleanup object URLs when component unmounts
    useEffect(() => {
        return () => {
            imageData.forEach(item => {
                URL.revokeObjectURL(item.preview);
            });
        };
    }, [imageData]);

    // Reset images and video when modal closes
    useEffect(() => {
        if (!open) {
            // Cleanup all preview URLs
            imageData.forEach(item => {
                URL.revokeObjectURL(item.preview);
            });
            setImageData([]);
            setHasVideo(false);
            setLinks([]);
            setHasPoll(false);
            setPollOptions([{ id: 1, name: "" }]);
            setVideoUrl("");
            setSelectedTopic(topics[0].id);
            setTitle("");
            setContent("");
            setError("");
            setIsSubmitting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Reset video URL when video modal closes without adding
    useEffect(() => {
        if (!videoModalOpen && !hasVideo) {
            setVideoUrl("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoModalOpen]);

    // Reset link input error when link modal closes
    useEffect(() => {
        if (!linkModalOpen) {
            setLinkInputError("");
        }
    }, [linkModalOpen]);

    useEffect(() => {
        if (!linkModalOpen) {
            setLinkInput("");
            setLinkNameInput("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linkModalOpen]);

    // Detect if we're on a mobile device
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint
        };

        // Check on mount
        checkMobile();

        // Listen for resize events
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const handleOpenChange = (newOpen: boolean) => {
        // Prevent closing while submitting
        if (!newOpen && isSubmitting) {
            return;
        }
        setOpen(newOpen);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild >
                    <div className="flex items-center gap-2 cursor-pointer">
                        <UserAvatar user={user} />

                        <div className="text-2xl text-grey-400 font-semibold">
                            Write your thoughts
                        </div>
                    </div>
                </DialogTrigger>

                <DialogContent fullScreen={isMobile} showCloseButton={false} className="p-4 sm:p-5 sm:max-w-3xl h-full sm:h-fit sm:max-h-[80vh] overflow-y-auto" >
                    {
                        isMobile && (
                            <div className="fixed top-0 left-0 px-4 pt-2 h-12 bg-white z-50 flex w-full justify-between items-center">
                                <button
                                    onClick={() => !isSubmitting && setOpen(false)}
                                    disabled={isSubmitting}
                                    className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    <XIcon className="size-6 stroke-grey-900" />
                                </button>

                                <Button
                                    variant="default"
                                    className="rounded-[10px] py-5 text-sm font-semibold px-10"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Posting..." : "Post"}
                                </Button>
                            </div>
                        )
                    }
                    <div className={cn("flex flex-col gap-7 ", isMobile ? "pt-12" : "")}>
                        <DialogTitle>
                            <div className="flex items-center gap-3">
                                <UserAvatar user={user} className="w-8 h-8 text-sm rounded-full" />
                                <span className="font-semibold text-sm md:text-base">
                                    {formatFullName(user.first_name || "", user.last_name || "")}
                                </span>

                                <span className="text-sm md:text-base text-grey-500 font-normal">
                                    Posting in
                                </span>

                                <Select defaultValue={filteredTopics[0].id.toString()} onValueChange={(value) => setSelectedTopic(parseInt(value))}>
                                    <SelectTrigger
                                        variant="secondary"
                                        className="bg-grey-200 rounded-full border-none shadow-none text-sm md:text-base font-semibold"
                                        iconClassName="size-4"
                                        size="sm"
                                    >
                                        <SelectValue placeholder="Select a community" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {filteredTopics.map((topic) => (
                                            <SelectItem className="text-sm md:text-base font-medium" key={topic.id} value={topic.id.toString()}>
                                                {topic.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </DialogTitle>

                        <Input
                            placeholder="Title"
                            className="h-12 md:text-base"
                            maxLength={200}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="w-full h-10 bg-white rounded-t-lg border border-grey-200 border-b-0 flex items-center justify-start gap-3 px-2">
                                <button
                                    type="button"
                                    onClick={handleImageSelect}
                                    className="hover:bg-grey-200 rounded-sm p-1"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.3335 2.16406C14.2095 2.16386 15.0664 2.41957 15.7993 2.89941C16.5322 3.37924 17.1093 4.06229 17.4595 4.86523C17.8096 5.66825 17.9181 6.55633 17.771 7.41992C17.6246 8.27927 17.2315 9.07759 16.6401 9.71777L16.4819 9.87891L9.22314 17.1377L9.19482 17.165L9.1626 17.1914L9.15576 17.1963L9.14893 17.2021C8.65207 17.6303 8.01144 17.855 7.35596 17.8311C6.7005 17.807 6.07805 17.5366 5.61377 17.0732C5.14943 16.6098 4.87733 15.9876 4.85205 15.332C4.82686 14.6766 5.04979 14.0348 5.47705 13.5371L5.55713 13.4502L5.56201 13.4473L5.58936 13.4199L11.6636 7.33301C11.7261 7.2704 11.8115 7.23545 11.8999 7.23535C11.9883 7.23532 12.0727 7.27059 12.1353 7.33301C12.1978 7.39548 12.2338 7.47993 12.2339 7.56836C12.234 7.65663 12.1985 7.74115 12.1362 7.80371L6.09424 13.8564L6.07959 13.8672L6.04053 13.9092C5.70988 14.2623 5.52333 14.7262 5.51807 15.21C5.51283 15.6937 5.68925 16.1623 6.01221 16.5225C6.33511 16.8824 6.78097 17.1088 7.26221 17.1562C7.64103 17.1935 8.01917 17.1157 8.35205 16.9404L8.41455 17.0029L8.76807 16.6494L16.02 9.39941L16.0269 9.39258L16.1597 9.25488L16.1694 9.24512C16.8403 8.50767 17.1968 7.53746 17.1646 6.54102C17.1323 5.54452 16.7129 4.59971 15.9956 3.90723C15.2783 3.21486 14.3197 2.82924 13.3228 2.83203C12.3258 2.83484 11.3691 3.2255 10.6558 3.92188L10.646 3.93164L10.5532 4.02734L10.5425 4.03516L10.5073 4.06934L2.73584 11.8447C2.70487 11.8757 2.66789 11.9003 2.62744 11.917C2.58701 11.9337 2.54326 11.9424 2.49951 11.9424C2.45597 11.9423 2.4128 11.9336 2.37256 11.917C2.33219 11.9003 2.29508 11.8756 2.26416 11.8447C2.23324 11.8138 2.20864 11.7767 2.19189 11.7363C2.17515 11.6959 2.16649 11.6522 2.1665 11.6084C2.16657 11.5201 2.20175 11.4355 2.26416 11.373V11.3721L10.0103 3.62305L10.0483 3.58789L10.0698 3.56641C10.4902 3.12348 10.9961 2.77036 11.5571 2.5293C12.1185 2.28814 12.7227 2.164 13.3335 2.16406Z" fill="#2B3034" stroke="#485057" />
                                    </svg>
                                </button>

                                <button

                                    onClick={() => setLinkModalOpen(true)}
                                    className="hover:bg-grey-200 rounded-sm p-1">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.8832 9.11719C12.7582 10.9922 12.7582 14.0255 10.8832 15.8922C9.00821 17.7589 5.97487 17.7672 4.1082 15.8922C2.24154 14.0172 2.2332 10.9839 4.1082 9.11719" stroke="#485057" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8.8248 11.1734C6.8748 9.22344 6.8748 6.05677 8.8248 4.09844C10.7748 2.14011 13.9415 2.14844 15.8998 4.09844C17.8581 6.04844 17.8498 9.21511 15.8998 11.1734" stroke="#485057" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setVideoModalOpen(true)}
                                    className="hover:bg-grey-200 rounded-sm p-1">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.8636 7.41329C17.7654 6.46444 17.5539 5.41552 16.7756 4.8643C16.1727 4.43683 15.3803 4.42103 14.6406 4.4219C13.0769 4.4219 11.5123 4.42454 9.94865 4.42542C8.44462 4.42717 6.94059 4.42805 5.43657 4.42981C4.80828 4.42981 4.19754 4.38153 3.61401 4.65363C3.11296 4.88711 2.72072 5.33126 2.48468 5.82544C2.15737 6.51272 2.08893 7.29128 2.04944 8.05141C1.97661 9.43563 1.98451 10.8234 2.07138 12.2067C2.13544 13.2161 2.29777 14.3317 3.07786 14.9751C3.76933 15.5448 4.7451 15.5729 5.6419 15.5738C8.48849 15.5764 11.336 15.579 14.1834 15.5808C14.5485 15.5817 14.9293 15.5746 15.3014 15.5343C16.0332 15.4553 16.7308 15.2455 17.2011 14.703C17.6759 14.1562 17.7978 13.3952 17.8698 12.6745C18.0453 10.9261 18.0435 9.16089 17.8636 7.41329ZM8.30247 12.4525V7.55022L12.546 10.0009L8.30247 12.4525Z" fill="#485057" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setHasPoll(true)}
                                    className="hover:bg-grey-200 rounded-sm p-1">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.5 15.8333V10.8333C7.5 10.3913 7.3244 9.96738 7.01184 9.65482C6.69928 9.34226 6.27536 9.16667 5.83333 9.16667H4.16667C3.72464 9.16667 3.30072 9.34226 2.98816 9.65482C2.67559 9.96738 2.5 10.3913 2.5 10.8333V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H5.83333C6.27536 17.5 6.69928 17.3244 7.01184 17.0118C7.3244 16.6993 7.5 16.2754 7.5 15.8333ZM7.5 15.8333V7.5C7.5 7.05797 7.67559 6.63405 7.98816 6.32149C8.30072 6.00893 8.72464 5.83333 9.16667 5.83333H10.8333C11.2754 5.83333 11.6993 6.00893 12.0118 6.32149C12.3244 6.63405 12.5 7.05797 12.5 7.5V15.8333M7.5 15.8333C7.5 16.2754 7.67559 16.6993 7.98816 17.0118C8.30072 17.3244 8.72464 17.5 9.16667 17.5H10.8333C11.2754 17.5 11.6993 17.3244 12.0118 17.0118C12.3244 16.6993 12.5 16.2754 12.5 15.8333M12.5 15.8333V4.16667C12.5 3.72464 12.6756 3.30072 12.9882 2.98816C13.3007 2.67559 13.7246 2.5 14.1667 2.5H15.8333C16.2754 2.5 16.6993 2.67559 17.0118 2.98816C17.3244 3.30072 17.5 3.72464 17.5 4.16667V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H14.1667C13.7246 17.5 13.3007 17.3244 12.9882 17.0118C12.6756 16.6993 12.5 16.2754 12.5 15.8333Z" stroke="#485057" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                <button

                                    className="hover:bg-grey-200 rounded-sm p-1">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.49984 18.3307H12.4998C16.6665 18.3307 18.3332 16.6641 18.3332 12.4974V7.4974C18.3332 3.33073 16.6665 1.66406 12.4998 1.66406H7.49984C3.33317 1.66406 1.6665 3.33073 1.6665 7.4974V12.4974C1.6665 16.6641 3.33317 18.3307 7.49984 18.3307Z" stroke="#485057" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M5.8335 6.875C6.66683 7.70833 8.02516 7.70833 8.86683 6.875" stroke="#485057" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M11.1333 6.875C11.9666 7.70833 13.325 7.70833 14.1666 6.875" stroke="#485057" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7 10.8359H13C13.4167 10.8359 13.75 11.1693 13.75 11.5859C13.75 13.6609 12.075 15.3359 10 15.3359C7.925 15.3359 6.25 13.6609 6.25 11.5859C6.25 11.1693 6.58333 10.8359 7 10.8359Z" stroke="#485057" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                <button className="hover:bg-grey-200 rounded-sm p-1">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.29585 14.224V5.77344H11.4085V14.224H9.29585ZM0.141113 14.224V5.77344H7.18321V7.88607H2.25374V12.1113H5.07058V9.9987H7.18321V14.224H0.141113ZM13.5211 14.224V5.77344H19.859V7.88607H15.6337V9.29449H18.4506V11.4071H15.6337V14.224H13.5211Z" fill="#485057" />
                                    </svg>
                                </button>
                            </div>
                            <Textarea
                                placeholder="Write your thoughts.."
                                className="h-24 md:text-base rounded-t-none"
                                maxLength={1000}
                                rows={10}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        {
                            error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )
                        }

                        {
                            hasPoll && (
                                <Card className="shadow-none border-grey-200 space-y-3 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-semibold">Poll</span>

                                        <button className="hover:bg-grey-200 rounded-full p-1" onClick={() => setHasPoll(false)}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9.16992 14.8319L14.8299 9.17188" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M14.8299 14.8319L9.16992 9.17188" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {
                                            pollOptions.map((option, index) => (
                                                <div key={option.id} className="flex items-center justify-between gap-2">
                                                    <Input
                                                        placeholder={`Choice ${index + 1}`}
                                                        className="h-10 md:text-base"
                                                        value={option.name}
                                                        onChange={(e) => setPollOptions(pollOptions.map((o) => o.id === option.id ? { ...o, name: e.target.value } : o))}
                                                    />

                                                    <button
                                                        disabled={pollOptions.length === 1}
                                                        className={cn(" hover:bg-grey-200 rounded-full p-1 transition-all duration-300", pollOptions.length === 1 && "opacity-50 cursor-not-allowed")} onClick={() => setPollOptions(pollOptions.filter((o) => o.id !== option.id))}>
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M9.16992 14.8319L14.8299 9.17188" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M14.8299 14.8319L9.16992 9.17188" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>


                                    <div className="flex items-center justify-start gap-2">
                                        <Button variant="secondary" className="rounded-[10px] py-5 text-sm font-semibold px-4"
                                            onClick={handleAddPollOption}
                                        >
                                            Add Choice
                                        </Button>

                                        <Button variant="secondary" className="rounded-[10px] py-5 text-sm font-semibold px-4"
                                            onClick={() => setHasPoll(false)}
                                        >
                                            Cancel Poll
                                        </Button>
                                    </div>

                                </Card>
                            )
                        }

                        {
                            hasVideo && videoUrl && (
                                <div className="relative group">
                                    <div className="absolute -top-1 -right-0.5 bg-white rounded-full border p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto">
                                        <button className="hover:bg-grey-200 rounded-full p-1 bg-white pointer-events-auto" onClick={() => {
                                            setHasVideo(false);
                                            setVideoUrl("");
                                        }}>
                                            <XIcon className="w-3 h-3 stroke-grey-900" />
                                        </button>
                                    </div>
                                    <VideoEmbed url={videoUrl} className="w-full" />
                                </div>
                            )
                        }

                        {
                            links.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {links.map((link, index) => (
                                        <div key={index} className="flex items-center gap-2 justify-between text-orange-500 hover:underline">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                                            <button onClick={() => setLinks(links.filter((l) => l.id !== link.id))}>
                                                <XIcon className="w-4 h-4 stroke-grey-900" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        }

                        {
                            imageData.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {imageData.map((item, index) => (
                                        <div key={`${item.file.name}-${item.file.size}-${index}`} className="relative group">
                                            <img
                                                src={item.preview}
                                                alt={`Preview ${index + 1}`}
                                                className="h-52 w-52 object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute -top-1 -right-0.5 bg-white rounded-full border p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <XIcon className="w-3 h-3 stroke-grey-900" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleImageSelect}
                                        className="h-52 w-52 hover:bg-grey-200 transition-all duration-300 cursor-pointer border border-dashed border-grey-600 rounded-lg flex items-center justify-center">
                                        <PlusIcon className="w-4 h-4 text-orange-500" />
                                    </button>
                                </div>
                            )
                        }



                        {
                            !isMobile && (
                                <div className="flex items-center justify-end gap-3">
                                    <Button
                                        variant="secondary"
                                        className="rounded-[10px] py-5 text-sm font-semibold px-8"
                                        onClick={() => setOpen(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="rounded-[10px] py-5 text-sm font-semibold px-10"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Posting..." : "Post"}
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                </DialogContent>
            </Dialog >
            <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
                <DialogContent showCloseButton={false} className="sm:max-w-lg" >
                    <DialogTitle>
                        <div className="flex flex-col gap-3">
                            <span className="text-2xl font-semibold">Add Video</span>
                            <p className="text-sm text-grey-900">
                                You can add YouTube, Google Drive Videos, Zoom recording, Loom, or Vimeo link.
                            </p>
                        </div>
                    </DialogTitle>

                    <Input
                        type="url"
                        placeholder="Paste video link"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                    />

                    <div className="flex items-center justify-start gap-2">

                        <Button variant="secondary" className="rounded-[10px] py-5 text-sm font-semibold px-8 w-1/2" onClick={() => setVideoModalOpen(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant="default"
                            className="rounded-[10px] py-5 text-sm font-semibold px-8 w-1/2"
                            onClick={handleAddVideo}
                            disabled={!videoUrl.trim()}
                        >
                            Add Video
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
                <DialogContent showCloseButton={false} className="sm:max-w-lg" >
                    <DialogTitle>
                        <div className="flex flex-col gap-3">
                            <span className="text-2xl font-semibold">Add Link</span>
                        </div>
                    </DialogTitle>

                    <Input
                        type="url"
                        placeholder="Name"
                        value={linkNameInput}
                        onChange={(e) => setLinkNameInput(e.target.value)}
                    />

                    <div className="flex flex-col gap-1">
                        <Input
                            type="url"
                            placeholder="Link"
                            value={linkInput}
                            onChange={(e) => {
                                const value = e.target.value;
                                setLinkInput(value);

                                // Validate URL if there's input
                                if (value.trim()) {
                                    if (!isValidUrl(value.trim())) {
                                        setLinkInputError("Please enter a valid URL (e.g., https://example.com)");
                                    } else {
                                        setLinkInputError("");
                                    }
                                } else {
                                    setLinkInputError("");
                                }
                            }}
                            onBlur={(e) => {
                                const value = e.target.value.trim();
                                if (value && !isValidUrl(value)) {
                                    setLinkInputError("Please enter a valid URL (e.g., https://example.com)");
                                } else {
                                    setLinkInputError("");
                                }
                            }}
                            className={linkInputError ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {linkInputError && (
                            <p className="text-sm text-red-500">{linkInputError}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-start gap-2">

                        <Button variant="secondary" className="rounded-[10px] py-5 text-sm font-semibold px-8 w-1/2" onClick={() => {
                            setLinkModalOpen(false);
                            setLinkInputError("");
                        }}>
                            Cancel
                        </Button>

                        <Button
                            variant="default"
                            className="rounded-[10px] py-5 text-sm font-semibold px-8 w-1/2"
                            onClick={() => {
                                const trimmedUrl = linkInput.trim();
                                if (isValidUrl(trimmedUrl)) {
                                    setLinks([...links, { id: links.length + 1, url: trimmedUrl, name: linkNameInput }]);
                                    setLinkModalOpen(false);
                                    setLinkInput("");
                                    setLinkNameInput("");
                                    setLinkInputError("");
                                }
                            }}
                            disabled={!linkInput.trim() || !linkNameInput.trim() || !!linkInputError}
                        >
                            Add Link
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
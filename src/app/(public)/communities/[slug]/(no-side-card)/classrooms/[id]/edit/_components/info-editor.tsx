import { useEffect, useState } from "react";
import { AccessTypeSelector } from "../../../_components/access-type-selector";
import { CoverUpload } from "../../../_components/cover-upload";
import { useClassroomEditorContext } from "./classroom-editor-context";
import { ClassroomType } from "@/enums/enums";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function InfoEditor() {

    const accessOptions = [
        {
            value: ClassroomType.PUBLIC,
            label: "Open to All",
            description: "All members can access the course"
        },
        {
            value: ClassroomType.ONE_TIME_PAYMENT,
            label: "One Time Payment",
            description: ""
        },
        {
            value: ClassroomType.TIME_UNLOCK,
            label: "Time Unlock",
            description: ""
        },
    ];

    const { classroom, updateClassroomData, updateCoverData } = useClassroomEditorContext();

    const [name, setName] = useState(classroom.name);
    const [description, setDescription] = useState(classroom.description);
    const [type, setType] = useState(classroom.type);

    const [oneTimeAmount, setOneTimeAmount] = useState(classroom.amount_one_time);
    const [timeUnlockInDays, setTimeUnlockInDays] = useState(classroom.time_unlock_in_days);

    useEffect(() => {
        updateClassroomData({
            name,
            description,
            type: type as ClassroomType,
            oneTimeAmount: oneTimeAmount || 0,
            timeUnlockInDays: timeUnlockInDays || 0,
        });
    }, [name, description, type, oneTimeAmount, timeUnlockInDays]);

    return (
        <div className="max-w-3xl mx-auto w-full flex items-start px-4">
            <div className="w-full space-y-6">
                {/* Course Cover Upload */}
                <CoverUpload
                    coverUrl={classroom.cover_url || ''}
                    onFileChange={(file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64String = reader.result as string;
                            updateCoverData(base64String);
                        };
                        reader.readAsDataURL(file);
                    }}
                />

                {/* Course Name */}
                <div className="space-y-2">
                    <input
                        id="course-name"
                        className="w-full text-xl font-medium border-none outline-none ring-0 placeholder:text-grey-400"
                        type="text"
                        placeholder="Name Your Course"
                        value={classroom.name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Course Description */}
                <div className="space-y-2">
                    <textarea
                        id="course-description"
                        className="w-full text-base font-medium border-none outline-none ring-0 placeholder:text-grey-400"
                        placeholder="Write Course Description"
                        value={classroom.description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                {/* Course Access */}
                <div className="space-y-4">
                    <Label className="text-grey-900 font-semibold text-base">
                        Course Access
                    </Label>

                    <div className="flex w-full gap-4">
                        {accessOptions.map((option) => {
                            const isSelected = type === option.value;
                            return (
                                <div key={option.value} className="w-1/3">
                                    <button
                                        type="button"
                                        onClick={() => setType(option.value)}
                                        className={`w-full text-left bg-gray-200 rounded-lg px-4 py-2.5 transition-all cursor-pointer hover:bg-gray-300`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected
                                                ? "border-[#F7670E]"
                                                : "border-grey-400"
                                                }`}>
                                                {isSelected && (
                                                    <div className="w-2 h-2 rounded-full bg-[#F7670E]"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-grey-900 text-sm">
                                                    {option.label}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-sm">
                        {type === ClassroomType.PUBLIC && (
                            <div>
                                <strong>All members</strong> can access the course
                            </div>
                        )}
                        {type === ClassroomType.ONE_TIME_PAYMENT && (
                            <>
                                <div className="mb-2">
                                    <strong>All members</strong> must make a one-time payment to access the course.
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-grey-900 font-semibold text-sm">
                                        Enter One Time Payment
                                    </Label>

                                    <div className="w-full relative text-lg">
                                        <Input
                                            className="pl-6 bg-grey-100 border-2 py-6 rounded-[16px] border-[#0E1011]/70 text-lg!"
                                            type="number"
                                            placeholder=""
                                            min={0}
                                            value={oneTimeAmount || ""}
                                            onChange={(e) => setOneTimeAmount(e.target.value ? Number(e.target.value) : 0)}
                                        />

                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <span className="text-grey-900">
                                                ₹
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {type === ClassroomType.TIME_UNLOCK && (
                            <>
                                <div className="mb-2">
                                    <strong>All members</strong> unlock access after x no. of days
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-grey-900 font-semibold text-sm">
                                        Access Starts At Day
                                    </Label>

                                    <div className="w-full relative text-lg">
                                        <Input
                                            className="pl-6 bg-grey-100 border-2 py-6 rounded-[16px] border-[#0E1011]/70 text-lg!"
                                            type="number"
                                            placeholder=""
                                            min={0}
                                            value={timeUnlockInDays || ""}
                                            onChange={(e) => setTimeUnlockInDays(e.target.value ? Number(e.target.value) : 0)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
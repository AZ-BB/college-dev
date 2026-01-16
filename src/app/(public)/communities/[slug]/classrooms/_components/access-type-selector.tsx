import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClassroomType } from "@/enums/enums";
import { useClassroomContext } from "./classroom-context";

export function AccessTypeSelector() {
    const { classroomData, updateClassroomData } = useClassroomContext();

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

    return (
        <div className="space-y-4">
            <Label className="text-grey-900 font-semibold text-base">
                Course Access
            </Label>

            <div className="flex w-full gap-4">
                {accessOptions.map((option) => {
                    const isSelected = classroomData.type === option.value;
                    return (
                        <div key={option.value} className="w-1/3">
                            <button
                                type="button"
                                onClick={() => updateClassroomData({ type: option.value })}
                                className={`w-full text-left bg-gray-200 cursor-pointer rounded-lg px-4 py-2.5 hover:bg-gray-300 transition-all`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        isSelected
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
                {classroomData.type === ClassroomType.PUBLIC && (
                    <div>
                        <strong>All members</strong> can access the course
                    </div>
                )}
                {classroomData.type === ClassroomType.ONE_TIME_PAYMENT && (
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
                                    value={classroomData.oneTimePayment || ""}
                                    onChange={(e) => updateClassroomData({ oneTimePayment: e.target.value ? Number(e.target.value) : undefined })}
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

                {classroomData.type === ClassroomType.TIME_UNLOCK && (
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
                                    value={classroomData.timeUnlockInDays || ""}
                                    onChange={(e) => updateClassroomData({ timeUnlockInDays: e.target.value ? Number(e.target.value) : undefined })}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

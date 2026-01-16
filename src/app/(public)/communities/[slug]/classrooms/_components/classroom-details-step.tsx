import { useClassroomContext } from "./classroom-context";
import { CoverUpload } from "./cover-upload";
import { AccessTypeSelector } from "./access-type-selector";

export function ClassroomDetailsStep() {
    const { classroomData, updateClassroomData, handleCoverChange } = useClassroomContext();

    const handleFileChange = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            handleCoverChange(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="max-w-3xl mx-auto w-full flex items-start px-4">
            <div className="w-full space-y-6">
                {/* Course Cover Upload */}
                <CoverUpload
                    coverUrl={classroomData.coverUrl}
                    onFileChange={handleFileChange}
                />

                {/* Course Name */}
                <div className="space-y-2">
                    <input
                        id="course-name"
                        className="w-full text-xl font-medium border-none outline-none ring-0 placeholder:text-grey-400"
                        type="text"
                        placeholder="Name Your Course"
                        value={classroomData.name}
                        onChange={(e) => updateClassroomData({ name: e.target.value })}
                    />
                </div>

                {/* Course Description */}
                <div className="space-y-2">
                    <textarea
                        id="course-description"
                        className="w-full text-base font-medium border-none outline-none ring-0 placeholder:text-grey-400"
                        placeholder="Write Course Description"
                        value={classroomData.description}
                        onChange={(e) => updateClassroomData({ description: e.target.value })}
                        rows={3}
                    />
                </div>

                {/* Course Access */}
                <AccessTypeSelector />
            </div>
        </div>
    );
}

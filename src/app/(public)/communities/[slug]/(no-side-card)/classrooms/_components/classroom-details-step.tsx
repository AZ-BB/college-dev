import { useClassroomContext } from "./classroom-context";
import { CoverUpload } from "./cover-upload";
import { AccessTypeSelector } from "./access-type-selector";

export function ClassroomDetailsStep() {
    const { classroomData, updateClassroomData, handleCoverChange, mode } = useClassroomContext();
    const isReadOnly = mode === 'view';

    const handleFileChange = (file: File) => {
        if (isReadOnly) return;
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
                    readOnly={isReadOnly}
                />

                {/* Course Name */}
                <div className="space-y-2">
                    <input
                        id="course-name"
                        className="w-full text-xl font-medium border-none outline-none ring-0 placeholder:text-grey-400"
                        type="text"
                        placeholder="Name Your Course"
                        value={classroomData.name}
                        onChange={(e) => !isReadOnly && updateClassroomData({ name: e.target.value })}
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                    />
                </div>

                {/* Course Description */}
                <div className="space-y-2">
                    <textarea
                        id="course-description"
                        className="w-full text-base font-medium border-none outline-none ring-0 placeholder:text-grey-400"
                        placeholder="Write Course Description"
                        value={classroomData.description}
                        onChange={(e) => !isReadOnly && updateClassroomData({ description: e.target.value })}
                        rows={3}
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                    />
                </div>

                {/* Course Access */}
                <AccessTypeSelector readOnly={isReadOnly} updateClassroomData={updateClassroomData} classroomData={classroomData} />
            </div>
        </div>
    );
}

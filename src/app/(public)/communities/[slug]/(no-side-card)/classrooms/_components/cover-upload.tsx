import { useRef } from "react";
import { ArrowUp } from "lucide-react";
import UploadIcon from "@/components/icons/upload";

interface CoverUploadProps {
    coverUrl: string;
    onFileChange: (file: File) => void;
    readOnly?: boolean;
}

export function CoverUpload({ coverUrl, onFileChange, readOnly = false }: CoverUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCoverClick = () => {
        if (readOnly) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        const file = e.target.files?.[0];
        if (!file) return;
        onFileChange(file);
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={readOnly}
            />

            {coverUrl ? (
                <div className="relative group">
                    <img
                        src={coverUrl}
                        alt="Course cover"
                        className="w-full h-[360px] object-cover rounded-lg"
                    />
                    {!readOnly && (
                        <div
                            className="absolute inset-0 bg-black/0 hover:bg-black/20 cursor-pointer flex items-center justify-center rounded-lg transition-all"
                            onClick={handleCoverClick}
                        >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                <ArrowUp className="w-5 h-5 text-white" />
                                <span className="text-white font-medium">Change Cover</span>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`w-full h-[360] border-2 border-dashed border-grey-300 rounded-lg flex items-center justify-center gap-2 ${readOnly ? '' : 'cursor-pointer hover:border-grey-400 hover:bg-grey-50'} transition-all`}
                    onClick={handleCoverClick}
                >
                    <UploadIcon className="w-6 h-6 stroke-grey-700" />
                    <span className="text-grey-700 font-medium">Add Course Cover</span>
                </div>
            )}
        </div>
    );
}

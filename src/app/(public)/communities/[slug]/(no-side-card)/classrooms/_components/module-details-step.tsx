import { ModuleList } from "./module-list";
import { ModuleEditor } from "./module-editor";

export function ModuleDetailsStep() {
    return (
        <div className="max-w-6xl mx-auto gap-10 w-full h-[calc(100vh-100px)] flex items-start">
            <ModuleList />
            <div className="w-3/4">
                <ModuleEditor />
            </div>
        </div>
    );
}

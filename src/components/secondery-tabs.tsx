import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function SecondaryTabs({
    tabs,
    onTabChange,
    defaultValue,
}: {
    tabs: { label: string, value: string, count?: number }[]
    onTabChange?: (value: string) => void
    defaultValue?: string
}) {
    return (
        <Tabs defaultValue={defaultValue} onValueChange={onTabChange}>
            <TabsList variant="pill">
                {tabs.map((tab) => (
                    <TabsTrigger className="flex gap-2 items-center" key={tab.value} value={tab.value}>{tab.label}
                        {
                            tab.count !== undefined &&
                            < span className="group-hover:bg-orange-500 group-hover:text-white transition-all duration-100 group-data-[state=active]:bg-orange-500 group-data-[state=active]:text-white px-1.5 py-0.5 rounded-[10px] font-semibold bg-grey-200 text-grey-600">{tab.count}</span>
                        }
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
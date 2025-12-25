import { getUserData } from "@/utils/get-user-data";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const user = await getUserData();
    redirect(`/profile/${user?.username}`);
}
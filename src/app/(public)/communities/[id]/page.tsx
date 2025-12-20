import { getCommunityById } from "@/action/communities"
import { notFound } from "next/navigation"
import CommunityDetailPage from "./community-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const community = await getCommunityById(id)
  console.log(community)
  if (!community) {
    return {
      title: "Community Not Found",
    }
  }

  return {
    title: `${community.name} | theCollege`,
    description: community.description || `Join ${community.name} on theCollege`,
  }
}

export default async function CommunityPage({ params }: PageProps) {
  const { id } = await params
  const community = await getCommunityById(id)

  if (!community) {
    notFound()
  }

  return <CommunityDetailPage community={community} />
}


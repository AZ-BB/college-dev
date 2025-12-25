
import { notFound } from "next/navigation"
import CommunityDetailPage from "./community-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const community = undefined as any
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
  const community = undefined as any

  if (!community) {
    notFound()
  }

  return <CommunityDetailPage community={community} />
}


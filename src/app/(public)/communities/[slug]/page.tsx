
import CommunityDetailPage from "./_components/community-detail"
import { getCommunityBySlug } from "@/action/communities"
import NotFound from "./not-found"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params
  const { data: community, error } = await getCommunityBySlug(slug)

  if (error || !community) {
    return notFound()
  }

  // return <CommunityDetailPage community={community} />
  return (
    <div>
      <h1>Community About</h1>
    </div>
  )
}
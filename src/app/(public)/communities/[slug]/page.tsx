
import CommunityDetailPage from "./community-detail"
import { getCommunityBySlug } from "@/action/communities"
import NotFound from "./not-found"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

// export async function generateMetadata({ params }: PageProps) {
//   const { slug } = await params
//   const { data: community, error } = await getCommunityBySlug(slug)

//   if (error || !community) {
//     return {
//       title: "Community Not Found",
//     }
//   }

//   return {
//     title: `${community.name} | theCollege`,
//     description: community.description || `Join ${community.name} on theCollege`,
//   }
// }

export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params
  const { data: community, error } = await getCommunityBySlug(slug)

  if (error || !community) {
    return notFound()
  }

  return <CommunityDetailPage community={community} />
}
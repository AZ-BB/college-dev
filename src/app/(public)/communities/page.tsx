import { getCommunities } from "@/action/communities"
import CommunitiesList from "./communities-list"

export const metadata = {
  title: "Communities | theCollege",
  description:
    "Join outcome-driven communities or create yours now. Build skills or build income.",
}

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function CommunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q || ""
  const page = Number(params.page) || 1

  // Fetch communities based on search query
  const communities = await getCommunities({
    search: query,
    page: page,
  })

  if (communities.error) {
    return <div>Error: {communities.message}</div>
  }

  return (
    <CommunitiesList
      initialCommunities={communities.data?.communities || []}
      initialQuery={query}
      initialPage={page}
    />
  )
}
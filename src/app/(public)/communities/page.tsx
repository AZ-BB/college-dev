import { getCommunities, searchCommunities } from "@/action/communities"
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
  const communities = query
    ? await searchCommunities(query)
    : await getCommunities()

  return (
    <CommunitiesList
      initialCommunities={communities}
      initialQuery={query}
      initialPage={page}
    />
  )
}

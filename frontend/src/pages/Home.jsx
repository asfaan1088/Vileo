import Sidebar from "../components/Sidebar"
import Feed from "../components/Feed"
import { useSearchParams } from "react-router-dom"

function Home() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("query") || ""

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col lg:flex-row">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
          Recommended
        </h1>

        <Feed query={query} />
      </main>
    </div>
  )
}

export default Home

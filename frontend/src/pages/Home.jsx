import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import Feed from "../components/Feed"
import { useSearchParams } from "react-router-dom"

function Home() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("query") || ""

  return (
    <>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">
            Recommended
          </h1>

          <Feed query={query} />
        </main>
      </div>
    </>
  )
}

export default Home

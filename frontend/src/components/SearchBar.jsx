import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

function SearchInput({ initialQuery }) {
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const navigate = useNavigate()

  const handleSearch = (event) => {
    event.preventDefault()
    const query = searchTerm.trim()

    if (!query) {
      navigate("/")
      return
    }

    const params = new URLSearchParams({ query })
    navigate(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="mx-auto flex w-full max-w-2xl items-center">
      <input
        type="text"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search videos..."
        className="min-w-0 w-full rounded-l-full border border-gray-300 bg-gray-50 px-4 py-2.5 outline-none focus:border-rose-500 focus:bg-white"
      />

      <button type="submit" className="rounded-r-full border border-l-0 border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-100">
        Search
      </button>
    </form>
  )
}

function SearchBar() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("query") || ""

  return <SearchInput key={query} initialQuery={query} />
}

export default SearchBar

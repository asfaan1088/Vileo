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
    <form onSubmit={handleSearch} className="flex items-center w-full max-w-xl">
      <input
        type="text"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search videos..."
        className="w-full px-4 py-2 border border-gray-300 rounded-l-full outline-none focus:border-black"
      />

      <button type="submit" className="px-5 py-2 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100">
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

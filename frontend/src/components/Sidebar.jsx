import { Link } from "react-router-dom"

function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-gray-200 p-2 lg:w-56 lg:border-b-0 lg:border-r lg:p-4">
      <nav className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:flex-col">
        <Link to="/" className="whitespace-nowrap rounded-xl px-4 py-3 text-left font-medium hover:bg-gray-100">
          Home
        </Link>

        <Link to="/subscriptions" className="whitespace-nowrap rounded-xl px-4 py-3 text-left font-medium hover:bg-gray-100">
          Subscriptions
        </Link>

        <Link to="/playlists" className="whitespace-nowrap rounded-xl px-4 py-3 text-left font-medium hover:bg-gray-100">
          Playlists
        </Link>

        <Link to="/history" className="whitespace-nowrap rounded-xl px-4 py-3 text-left font-medium hover:bg-gray-100">
          History
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar

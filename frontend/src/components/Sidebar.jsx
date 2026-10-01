import { Link } from "react-router-dom"

function Sidebar() {
  return (
    <aside className="w-60 min-h-screen border-r border-gray-200 p-4">
      <nav className="flex flex-col gap-2">
        <button className="text-left px-4 py-3 rounded-lg hover:bg-gray-100">
          Home
        </button>

        <Link to="/subscriptions" className="text-left px-4 py-3 rounded-lg hover:bg-gray-100">
          Subscriptions
        </Link>

        <Link to="/playlists" className="text-left px-4 py-3 rounded-lg hover:bg-gray-100">
          Playlists
        </Link>

        <Link to="/history" className="text-left px-4 py-3 rounded-lg hover:bg-gray-100">
          History
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar

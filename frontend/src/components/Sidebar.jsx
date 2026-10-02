import { Link } from "react-router-dom"

function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-gray-200 p-4 lg:block">
      <nav className="sticky top-24 flex flex-col gap-1">
        <Link to="/" className="rounded-xl px-4 py-3 text-left font-medium hover:bg-gray-100">
          Home
        </Link>

        <Link to="/subscriptions" className="rounded-xl px-4 py-3 text-left font-medium hover:bg-gray-100">
          Subscriptions
        </Link>

        <Link to="/playlists" className="rounded-xl px-4 py-3 text-left font-medium hover:bg-gray-100">
          Playlists
        </Link>

        <Link to="/history" className="rounded-xl px-4 py-3 text-left font-medium hover:bg-gray-100">
          History
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar

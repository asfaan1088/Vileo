import { useEffect, useState } from "react"
import SearchBar from "./SearchBar"
import { Link } from "react-router-dom"
import { getCurrentUser } from "../services/userService"

function Navbar() {
  const [user, setUser] = useState(null)
  const [checkingUser, setCheckingUser] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then((response) => {
        setUser(response.data)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => setCheckingUser(false))
  }, [])

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 gap-6">
      <h1 className="text-2xl font-bold">
        Vileo
      </h1>

      <SearchBar />

      <div className="flex items-center gap-4">
        {!checkingUser && (user ? (
          <div className="flex items-center gap-3">
            <Link to="/upload" className="px-4 py-2 rounded-lg hover:bg-gray-100">
              Upload
            </Link>
            <Link to="/dashboard" className="px-4 py-2 rounded-lg hover:bg-gray-100">
              Dashboard
            </Link>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.username} avatar`}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                {user.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <span className="font-medium">{user.username}</span>
          </div>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-gray-100">
              Login
            </Link>

            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
              Sign Up
            </button>
          </>
        ))}
      </div>
    </nav>
  )
}

export default Navbar

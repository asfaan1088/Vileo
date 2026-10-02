import { useEffect, useState } from "react"
import SearchBar from "./SearchBar"
import { Link } from "react-router-dom"
import { getCurrentUser } from "../services/userService"

const themeAnimation = "https://lottie.host/embed/20e137d8-ae75-4ee7-813f-2838cf03b93d/o3xOtxiL6h.json"

function Navbar() {
  const [user, setUser] = useState(null)
  const [checkingUser, setCheckingUser] = useState(true)
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("vileo-theme")
    return savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem("vileo-theme", theme)
  }, [theme])

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
    <nav className="sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
      <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-base text-white">V</span>
        Vileo
      </Link>

      <div className="order-3 w-full md:order-none md:flex-1">
        <SearchBar />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-pressed={theme === "dark"}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          <iframe
            src={themeAnimation}
            title="Toggle light and dark mode"
            aria-hidden="true"
            tabIndex={-1}
            className="pointer-events-none h-11 w-11 border-0"
          />
        </button>
        {!checkingUser && (user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/upload" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-gray-100 sm:px-4">
              Upload
            </Link>
            <Link to="/dashboard" className="rounded-full px-2 py-2 text-sm font-medium hover:bg-gray-100 sm:px-4">
              Dashboard
            </Link>
            <span className="hidden max-w-32 truncate text-sm font-semibold sm:inline">{user.username}</span>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.username} avatar`}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
                {user.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/login" className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-gray-100 sm:px-4">
              Login
            </Link>

            <button className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
              Sign Up
            </button>
          </div>
        ))}
      </div>
    </nav>
  )
}

export default Navbar

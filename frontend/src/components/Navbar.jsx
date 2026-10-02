import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import SearchBar from "./SearchBar"
import { getCurrentUser } from "../services/userService"

const themeAnimation = "https://lottie.host/54c3ed7c-9e65-4729-bdb2-2178f99f54ec/0zBukiEvmC.json"

function Navbar() {
  const [user, setUser] = useState(null)
  const [checkingUser, setCheckingUser] = useState(true)
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("vileo-theme")
    return savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  })
  const animationContainerRef = useRef(null)
  const animationRef = useRef(null)
  const animationReadyRef = useRef(false)
  const themeRef = useRef(theme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem("vileo-theme", theme)
  }, [theme])

  useEffect(() => {
    themeRef.current = theme
    const animation = animationRef.current
    if (!animation || !animationReadyRef.current) return

    animation.setLoop(false)
    animation.setDirection(theme === "dark" ? 1 : -1)
    animation.play()
  }, [theme])

  useEffect(() => {
    let cancelled = false
    let animation
    let handleAnimationReady

    async function setupAnimation() {
      const [lottieModule, response] = await Promise.all([
        import("lottie-web/build/player/lottie_svg.js"),
        fetch(themeAnimation),
      ])
      if (!response.ok) throw new Error("Unable to load theme animation")

      const animationData = await response.json()
      if (cancelled) return

      const runtimeData = structuredClone(animationData)
      const ringLayerNames = new Set([
        "Shape Layer 1",
        "Shape Layer 2",
        "Shape Layer 3",
        "Shape Layer 5",
      ])
      runtimeData.layers.forEach((layer) => {
        if (ringLayerNames.has(layer.nm)) layer.hd = true
      })

      const lottie = lottieModule.default || lottieModule
      animation = lottie.loadAnimation({
        container: animationContainerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: runtimeData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      })
      animationRef.current = animation

      handleAnimationReady = () => {
        animationReadyRef.current = true
        animation.goToAndStop(
          themeRef.current === "dark" ? animation.getDuration(true) - 1 : 0,
          true,
        )
      }

      animation.addEventListener("DOMLoaded", handleAnimationReady)
    }

    setupAnimation().catch((error) => {
      if (!cancelled) console.error("Unable to load theme toggle animation:", error)
    })

    return () => {
      cancelled = true
      animationReadyRef.current = false
      if (animation) {
        animation.removeEventListener("DOMLoaded", handleAnimationReady)
        animation.destroy()
        animationRef.current = null
      }
    }
  }, [])

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
        <img src="/favicon.svg" alt="" className="h-9 w-9 object-contain" />
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
          className="flex h-11 w-11 items-center justify-center overflow-hidden border-0 bg-transparent p-0"
        >
          <span ref={animationContainerRef} aria-hidden="true" className="h-11 w-11" />
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

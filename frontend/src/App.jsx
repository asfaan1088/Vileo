import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import VideoPage from "./pages/VideoPage"
import Upload from "./pages/Upload"
import Channel from "./pages/Channel"
import Playlists from "./pages/Playlists"
import Playlist from "./pages/Playlist"
import Dashboard from "./pages/Dashboard"
import Subscriptions from "./pages/Subscriptions"
import History from "./pages/History"
import Navbar from "./components/Navbar"

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/video/:videoId" element={<VideoPage />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/channel/:userId" element={<Channel />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlist/:playlistId" element={<Playlist />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/history" element={<History />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App

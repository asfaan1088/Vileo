import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { uploadVideo } from "../services/videoService"

function VideoFilePreview({ file }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!file || !video) return

    const previewUrl = URL.createObjectURL(file)
    video.src = previewUrl
    return () => {
      URL.revokeObjectURL(previewUrl)
      video.removeAttribute("src")
    }
  }, [file])

  return <video ref={videoRef} controls className="mt-3 max-h-64 max-w-full rounded-lg object-contain" />
}

function ThumbnailFilePreview({ file }) {
  const imageRef = useRef(null)

  useEffect(() => {
    const image = imageRef.current
    if (!file || !image) return

    const previewUrl = URL.createObjectURL(file)
    image.src = previewUrl
    return () => {
      URL.revokeObjectURL(previewUrl)
      image.removeAttribute("src")
    }
  }, [file])

  return <img ref={imageRef} alt="Thumbnail preview" className="mt-3 max-h-48 max-w-full rounded-lg object-contain" />
}

function Upload() {
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [destination, setDestination] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (!destination) return
    const timeout = setTimeout(() => navigate(destination), 900)
    return () => clearTimeout(timeout)
  }, [destination, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (uploading) return

    setError("")
    setSuccess("")

    if (!videoFile) {
      setError("Please choose a video file.")
      return
    }
    if (!thumbnail) {
      setError("Please choose a thumbnail image.")
      return
    }
    if (!title.trim()) {
      setError("Please enter a video title.")
      return
    }
    if (!description.trim()) {
      setError("Please enter a video description.")
      return
    }

    const formData = new FormData()
    formData.append("videoFile", videoFile)
    formData.append("thumbnail", thumbnail)
    formData.append("title", title.trim())
    formData.append("description", description.trim())

    setUploading(true)
    try {
      const response = await uploadVideo(formData)
      setSuccess("Video uploaded successfully. Redirecting...")
      setDestination(response.data?._id ? `/video/${response.data._id}` : "/")
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6">
      <Link to="/" className="text-sm text-gray-600 hover:text-black">
        ← Home
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">Upload Video</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 p-5 sm:p-7">
        <div>
          <label htmlFor="videoFile" className="block font-medium mb-2">Video file</label>
          <input
            id="videoFile"
            type="file"
            accept="video/*"
            required
            disabled={uploading}
            onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
          {videoFile && <p className="mt-2 text-sm text-gray-500">{videoFile.name}</p>}
          {videoFile && (
            <VideoFilePreview file={videoFile} />
          )}
        </div>

        <div>
          <label htmlFor="thumbnail" className="block font-medium mb-2">Thumbnail</label>
          <input
            id="thumbnail"
            type="file"
            accept="image/*"
            required
            disabled={uploading}
            onChange={(event) => setThumbnail(event.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
          {thumbnail && <p className="mt-2 text-sm text-gray-500">{thumbnail.name}</p>}
          {thumbnail && (
            <ThumbnailFilePreview file={thumbnail} />
          )}
        </div>

        <div>
          <label htmlFor="title" className="block font-medium mb-2">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            disabled={uploading}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-medium mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            disabled={uploading}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        {error && <p className="text-red-600" role="alert">{error}</p>}
        {success && <p className="text-green-700" role="status">{success}</p>}

        <button
          type="submit"
          disabled={uploading || Boolean(destination)}
          className="w-full rounded-lg bg-black py-3 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </main>
  )
}

export default Upload

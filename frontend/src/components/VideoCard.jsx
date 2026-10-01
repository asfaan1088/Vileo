import { Link } from "react-router-dom"

function VideoCard({ video }) {
  return (
    <div className="overflow-hidden rounded-xl cursor-pointer">
      <Link to={`/video/${video._id}`}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover rounded-xl"
        />

        <div className="mt-3">
          <h2 className="font-semibold">
            {video.title}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {video.owner?.username || "Unknown User"}
          </p>

          <p className="text-sm text-gray-500">
            {video.views} views
          </p>
        </div>
      </Link>
    </div>
  )
}

export default VideoCard

import { Link } from "react-router-dom"

function VideoCard({ video }) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl">
      <Link to={`/video/${video._id}`} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-500">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="aspect-video w-full rounded-2xl bg-gray-200 object-cover"
        />

        <div className="px-1 pb-2 pt-3">
          <h2 className="line-clamp-2 text-base font-semibold leading-6 tracking-tight group-hover:text-rose-600">
            {video.title}
          </h2>

          <p className="mt-2 text-sm font-medium text-gray-600">
            {video.owner?.username || "Unknown User"}
          </p>

          <p className="mt-0.5 text-sm text-gray-500">
            {video.views} views
          </p>
        </div>
      </Link>
    </article>
  )
}

export default VideoCard

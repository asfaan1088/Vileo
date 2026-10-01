import { useEffect, useState } from "react"
import { addComment, getVideoComments } from "../services/commentService"
import { getCurrentUser } from "../services/userService"

function Comments({ videoId }) {
  const [commentResult, setCommentResult] = useState(null)
  const [user, setUser] = useState(null)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then((response) => {
        if (active) setUser(response.data)
      })
      .catch(() => {
        if (active) setUser(null)
      })

    getVideoComments(videoId)
      .then((response) => {
        if (active) {
          setCommentResult({ videoId, comments: response.data.comments, error: "" })
        }
      })
      .catch((fetchError) => {
        if (active) setCommentResult({ videoId, comments: [], error: fetchError.message })
      })

    return () => {
      active = false
    }
  }, [videoId])

  const currentResult = commentResult?.videoId === videoId ? commentResult : null
  const comments = currentResult?.comments || []
  const loading = !currentResult
  const error = currentResult?.error || ""

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError("")
    setSubmitting(true)

    try {
      const response = await addComment(videoId, content)
      setCommentResult((currentResult) => ({
        videoId,
        comments: [
          { ...response.data, owner: user },
          ...(currentResult?.videoId === videoId ? currentResult.comments : []),
        ],
        error: "",
      }))
      setContent("")
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comments</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add a comment..."
            rows={3}
            required
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-black"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="mt-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Comment"}
          </button>
          {submitError && <p className="mt-2 text-red-600">{submitError}</p>}
        </form>
      ) : (
        <p className="mb-6 text-gray-600">Login to comment.</p>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p className="text-red-600">Unable to load comments: {error}</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-600">No comments yet.</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <article key={comment._id} className="flex items-start gap-3">
              {comment.owner?.avatar ? (
                <img
                  src={comment.owner.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {comment.owner?.username?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-medium">
                  {comment.owner?.username || "Unknown User"}
                  {comment.createdAt && (
                    <span className="ml-2 font-normal text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Comments

import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import DOMPurify from "dompurify"

function PostDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])

  const [comment, setComment] = useState("")

  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)

  const [error, setError] = useState("")
  const [commentError, setCommentError] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)

  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // ==========================================
  // LIKE STATES
  // ==========================================

  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [likeError, setLikeError] = useState("")

  const user = JSON.parse(localStorage.getItem("user"))

  // ==========================================
  // GET POST
  // ==========================================

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/posts/${id}`
        )

        const data = await response.json()

        if (!response.ok) {
          setError(data.message || "Post not found")
          return
        }

        setPost(data)
      } catch (error) {
        console.error(error)

        setError(
          "Cannot connect to the server. Make sure the backend is running."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  // ==========================================
  // GET COMMENTS
  // ==========================================

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/posts/${id}/comments`
        )

        const data = await response.json()

        if (!response.ok) {
          setCommentError(
            data.message || "Failed to load comments"
          )
          return
        }

        setComments(data)
      } catch (error) {
        console.error(error)

        setCommentError(
          "Cannot connect to the server."
        )
      } finally {
        setCommentsLoading(false)
      }
    }

    fetchComments()
  }, [id])

  // ==========================================
  // GET LIKES
  // ==========================================

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const userId = user ? user.id : ""

        const response = await fetch(
          `http://localhost:5000/api/posts/${id}/likes?user_id=${userId}`
        )

        const data = await response.json()

        if (!response.ok) {
          setLikeError(
            data.message || "Failed to load likes"
          )
          return
        }

        setLikes(data.likes || 0)
        setLiked(Boolean(data.liked))
      } catch (error) {
        console.error(error)

        setLikeError(
          "Cannot load likes. Make sure the backend is running."
        )
      }
    }

    fetchLikes()
  }, [id, user])

  // ==========================================
  // LIKE / UNLIKE
  // ==========================================

  const handleLike = async () => {
    setLikeError("")

    if (!user) {
      setLikeError("Please login to like this post.")
      return
    }

    if (likeLoading) {
      return
    }

    setLikeLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${id}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setLikeError(
          data.message || "Failed to like post"
        )
        return
      }

      setLiked(Boolean(data.liked))
      setLikes(Number(data.likes) || 0)
    } catch (error) {
      console.error(error)

      setLikeError(
        "Cannot connect to the server. Make sure the backend is running."
      )
    } finally {
      setLikeLoading(false)
    }
  }

  // ==========================================
  // DELETE POST
  // ==========================================

  const handleDelete = async () => {
    if (!user) {
      setDeleteError("Please login first.")
      return
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    )

    if (!confirmed) {
      return
    }

    setDeleteLoading(true)
    setDeleteError("")

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setDeleteError(
          data.message || "Failed to delete post"
        )
        return
      }

      alert("Post deleted successfully.")

      navigate("/")
    } catch (error) {
      console.error(error)

      setDeleteError(
        "Cannot connect to the server. Make sure the backend is running."
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  // ==========================================
  // SUBMIT COMMENT
  // ==========================================

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    setCommentError("")

    if (!user) {
      setCommentError("Please login to comment.")
      return
    }

    if (!comment.trim()) {
      setCommentError("Please write a comment.")
      return
    }

    setCommentLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            content: comment.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setCommentError(
          data.message || "Failed to add comment"
        )
        return
      }

      setComments((previousComments) => [
        ...previousComments,
        {
          ...data.comment,
          full_name: user.full_name,
        },
      ])

      setComment("")
    } catch (error) {
      console.error(error)

      setCommentError(
        "Cannot connect to the server. Make sure the backend is running."
      )
    } finally {
      setCommentLoading(false)
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          Loading post...
        </p>
      </div>
    )
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-md">

          <h1 className="text-2xl font-bold text-gray-900">
            Post not found
          </h1>

          <p className="mt-2 text-red-600">
            {error}
          </p>

          <Link
            to="/"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>

        </div>
      </div>
    )
  }

  // ==========================================
  // CHECK POST OWNER
  // ==========================================

  const isOwner =
    user &&
    post &&
    String(user.id) === String(post.user_id)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="border-b bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            BlogSpace
          </Link>

          <div className="flex items-center gap-4">

            {user && (
              <span className="text-sm font-medium text-gray-700">
                Hi, {user.full_name}
              </span>
            )}

            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Home
            </Link>

          </div>

        </div>

      </nav>


      {/* ==========================================
          MAIN
      ========================================== */}

      <main className="mx-auto max-w-4xl px-6 py-10">

        {/* ==========================================
            POST
        ========================================== */}

        <article className="rounded-xl bg-white p-8 shadow-md">

          {/* Date */}

          <p className="text-sm text-gray-500">
            {post.created_at
              ? new Date(
                  post.created_at
                ).toLocaleDateString()
              : ""}
          </p>


          {/* Title */}

          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            {post.title}
          </h1>


          {/* Author */}

          <Link
            to={`/${post.username}`}
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            By @{post.username || post.full_name}
          </Link>


          {/* ==========================================
              EDIT / DELETE
          ========================================== */}

          {isOwner && (
            <div className="mt-6 flex gap-3">

              <Link
                to={`/posts/${post.id}/edit`}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Edit Post
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Post"}
              </button>

            </div>
          )}

          {deleteError && (
            <p className="mt-3 text-sm text-red-600">
              {deleteError}
            </p>
          )}


          {/* Divider */}

          <div className="my-8 border-t" />


          {/* Content */}

         <div
  className="text-lg leading-8 text-gray-700"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(post.content || ""),
  }}
/>

          {/* ==========================================
              LIKE BUTTON
          ========================================== */}

          <div className="mt-8 border-t pt-6">

            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`rounded-lg px-5 py-3 font-semibold transition ${
                liked
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {likeLoading
                ? "Loading..."
                : liked
                ? "♥ Liked"
                : "♡ Like"}
            </button>

            <span className="ml-3 text-gray-600">
              {likes} {likes === 1 ? "Like" : "Likes"}
            </span>

            {likeError && (
              <p className="mt-2 text-sm text-red-600">
                {likeError}
              </p>
            )}

          </div>

        </article>


        {/* ==========================================
            COMMENTS
        ========================================== */}

        <section className="mt-8 rounded-xl bg-white p-8 shadow-md">

          <h2 className="text-2xl font-bold text-gray-900">
            Comments
          </h2>


          {/* Add Comment */}

          {user ? (

            <form
              onSubmit={handleCommentSubmit}
              className="mt-6"
            >

              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                placeholder="Write a comment..."
                rows="4"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              {commentError && (
                <p className="mt-2 text-sm text-red-600">
                  {commentError}
                </p>
              )}

              <button
                type="submit"
                disabled={commentLoading}
                className="mt-3 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {commentLoading
                  ? "Posting..."
                  : "Post Comment"}
              </button>

            </form>

          ) : (

            <div className="mt-5 rounded-lg bg-gray-50 p-4">

              <p className="text-gray-600">
                Please login to leave a comment.
              </p>

              <Link
                to="/login"
                className="mt-3 inline-block font-semibold text-blue-600"
              >
                Login
              </Link>

            </div>

          )}


          {/* ==========================================
              COMMENTS LIST
          ========================================== */}

          <div className="mt-8">

            {commentsLoading ? (

              <p className="text-gray-600">
                Loading comments...
              </p>

            ) : comments.length === 0 ? (

              <p className="text-gray-500">
                No comments yet. Be the first to comment!
              </p>

            ) : (

              <div className="space-y-4">

                {comments.map((item) => (

                  <div
                    key={item.id}
                    className="rounded-lg border bg-gray-50 p-4"
                  >

                    <div className="flex items-center justify-between">

                      <p className="font-semibold text-gray-900">
                        {item.full_name}
                      </p>

                      <p className="text-xs text-gray-500">

                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleDateString()
                          : ""}

                      </p>

                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-gray-700">
                      {item.content}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  )
}

export default PostDetails
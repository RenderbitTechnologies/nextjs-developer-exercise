import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")

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

        // Make sure only the owner can edit
        if (
          !user ||
          String(user.id) !== String(data.user_id)
        ) {
          setError(
            "You are not allowed to edit this post."
          )
          return
        }

        setTitle(data.title || "")
        setContent(data.content || "")
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
  // SAVE CHANGES
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")

    if (!user) {
      setError("Please login first.")
      return
    }

    if (!title.trim()) {
      setError("Please enter a title.")
      return
    }

    if (!content.trim()) {
      setError("Please enter some content.")
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            user_id: user.id,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message || "Failed to update post"
        )
        return
      }

      alert("Post updated successfully!")

      navigate(`/posts/${id}`)
    } catch (error) {
      console.error(error)

      setError(
        "Cannot connect to the server. Make sure the backend is running."
      )
    } finally {
      setSaving(false)
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
            Cannot edit post
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <Link
            to={`/posts/${id}`}
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Post
          </Link>

        </div>
      </div>
    )
  }

  // ==========================================
  // EDIT PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}

      <nav className="border-b bg-white">

        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            BlogSpace
          </Link>

          <Link
            to={`/posts/${id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>

        </div>

      </nav>


      {/* Main */}

      <main className="mx-auto max-w-3xl px-6 py-10">

        <div className="rounded-xl bg-white p-8 shadow-md">

          <h1 className="text-3xl font-bold text-gray-900">
            Edit Post
          </h1>

          <p className="mt-2 text-gray-600">
            Update your post and save your changes.
          </p>


          {/* Error */}

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* Title */}

            <div>

              <label className="mb-2 block font-medium text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Enter post title"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>


            {/* Content */}

            <div>

              <label className="mb-2 block font-medium text-gray-700">
                Content
              </label>

              <textarea
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                placeholder="Write your post..."
                rows="12"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>


            {/* Buttons */}

            <div className="flex gap-3">

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <Link
                to={`/posts/${id}`}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

            </div>

          </form>

        </div>

      </main>

    </div>
  )
}

export default EditPost
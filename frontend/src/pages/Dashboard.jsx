import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getTextPreview } from "../utils/content"

function Dashboard() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/posts"
        )

        const data = await response.json()

        if (!response.ok) {
          setError(
            data.message || "Failed to load posts"
          )
          return
        }

        // Show only the logged-in user's posts
        const myPosts = data.filter(
          (post) =>
            String(post.user_id) === String(user.id)
        )

        setPosts(myPosts)
      } catch (error) {
        console.error(error)

        setError(
          "Cannot connect to the server. Make sure the backend is running."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [navigate, user])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}

      <nav className="border-b bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            BlogSpace
          </Link>

          <div className="flex items-center gap-4">

            <span className="text-sm font-medium text-gray-700">
              Hi, {user.full_name}
            </span>

            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900"
            >
              Home
            </Link>

          </div>

        </div>

      </nav>


      {/* Main */}

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Profile Card */}

        <section className="rounded-xl bg-white p-8 shadow-md">

          <div className="flex flex-col items-center text-center">

            {/* Profile Image */}

            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt={user.full_name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                {user.full_name
                  ? user.full_name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>
            )}

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {user.full_name}
            </h1>

            <p className="mt-1 text-gray-500">
              @{user.username}
            </p>

            <p className="mt-3 text-gray-600">
              {posts.length}{" "}
              {posts.length === 1
                ? "Post"
                : "Posts"}
            </p>

          </div>

        </section>


        {/* My Posts */}

        <section className="mt-8">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-2xl font-bold text-gray-900">
              My Posts
            </h2>

            <Link
              to="/create-post"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Create New Post
            </Link>

          </div>


          {/* Loading */}

          {loading && (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">
                Loading your posts...
              </p>
            </div>
          )}


          {/* Error */}

          {!loading && error && (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">

              <p className="text-red-600">
                {error}
              </p>

            </div>
          )}


          {/* No Posts */}

          {!loading &&
            !error &&
            posts.length === 0 && (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm">

                <h3 className="text-xl font-semibold text-gray-900">
                  You haven't published any posts yet.
                </h3>

                <p className="mt-2 text-gray-600">
                  Start writing your first post.
                </p>

                <Link
                  to="/create-post"
                  className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Create Your First Post
                </Link>

              </div>
            )}


          {/* Posts */}

          {!loading &&
            !error &&
            posts.length > 0 && (

              <div className="space-y-5">

                {posts.map((post) => (

                  <article
                    key={post.id}
                    className="rounded-xl bg-white p-6 shadow-sm"
                  >

                    <p className="text-sm text-gray-500">
                      {post.created_at
                        ? new Date(
                            post.created_at
                          ).toLocaleDateString()
                        : ""}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-gray-900">
                      {post.title}
                    </h3>

                    <p className="mt-3 leading-7 text-gray-600">
                      {post.content ? getTextPreview(post.content, 250) : ""}
                    </p>

                    <div className="mt-5 flex gap-3">

                      <Link
                        to={`/posts/${post.id}`}
                        className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200"
                      >
                        View
                      </Link>

                      <Link
                        to={`/posts/${post.id}/edit`}
                        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                      >
                        Edit
                      </Link>

                    </div>

                  </article>

                ))}

              </div>

            )}

        </section>

      </main>

    </div>
  )
}

export default Dashboard
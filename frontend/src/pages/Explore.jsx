import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getTextPreview } from "../utils/content"

function Explore() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/posts"
        )

        const data = await response.json()

        if (!response.ok) {
          setError(data.message || "Failed to load posts")
          return
        }

        setPosts(data)
      } catch (error) {
        console.error(error)
        setError("Cannot connect to the backend server.")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

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

          <div className="flex gap-3">

            <Link
              to="/"
              className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Home
            </Link>

            <Link
              to="/explore"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Explore
            </Link>

          </div>

        </div>

      </nav>

      {/* Header */}

      <header className="mx-auto max-w-6xl px-6 py-12">

        <h1 className="text-4xl font-bold text-gray-900">
          Explore
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          Discover stories and ideas from the BlogSpace community.
        </p>

      </header>

      {/* Posts */}

      <main className="mx-auto max-w-6xl px-6 pb-12">

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            Loading posts...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-red-600">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          posts.length === 0 && (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold">
                No posts yet
              </h2>

              <p className="mt-2 text-gray-600">
                Be the first person to publish a story.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          posts.length > 0 && (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {posts.map((post) => (

                <article
                  key={post.id}
                  className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {post.created_at && (
                    <p className="text-sm text-gray-500">
                      {new Date(
                        post.created_at
                      ).toLocaleDateString()}
                    </p>
                  )}

                  <h2 className="mt-2 text-xl font-bold text-gray-900">
                    {post.title}
                  </h2>

                  {post.username && (
                    <Link
                      to={`/${post.username}`}
                      className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                    >
                      By @{post.username}
                    </Link>
                  )}

                  <p className="mt-4 leading-6 text-gray-600">
                    {post.content ? getTextPreview(post.content, 150) : ""}
                  </p>

                  <Link
                    to={`/posts/${post.id}`}
                    className="mt-5 inline-block font-medium text-blue-600 hover:text-blue-800"
                  >
                    Read more →
                  </Link>

                </article>

              ))}

            </div>

          )}

      </main>

    </div>
  )
}

export default Explore
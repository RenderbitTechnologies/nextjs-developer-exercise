import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { getTextPreview } from "../utils/content"

function Profile() {
  const { username } = useParams()

  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ==========================================
  // FOLLOW STATES
  // ==========================================

  const [following, setFollowing] = useState(false)
  const [followers, setFollowers] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  const [followLoading, setFollowLoading] = useState(false)
  const [followError, setFollowError] = useState("")

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  )

  // ==========================================
  // GET PROFILE
  // ==========================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/users/username/${username}`
        )

        const data = await response.json()

        if (!response.ok) {
          setError(
            data.message || "User not found"
          )
          return
        }

        setUser(data.user)
        setPosts(data.posts)
      } catch (error) {
        console.error(error)

        setError(
          "Cannot connect to the server. Make sure the backend is running."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  // ==========================================
  // GET FOLLOW STATUS + COUNTS
  // ==========================================

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchFollowData = async () => {
      try {
        const followerId = currentUser
          ? currentUser.id
          : ""

        // Get follow status
        const statusResponse = await fetch(
          `http://localhost:5000/api/users/${user.id}/follow-status?follower_id=${followerId}`
        )

        const statusData =
          await statusResponse.json()

        if (statusResponse.ok) {
          setFollowing(
            Boolean(statusData.following)
          )
        }

        // Get follower/following counts
        const countResponse = await fetch(
          `http://localhost:5000/api/users/${user.id}/follow-counts`
        )

        const countData =
          await countResponse.json()

        if (countResponse.ok) {
          setFollowers(
            Number(countData.followers) || 0
          )

          setFollowingCount(
            Number(countData.following) || 0
          )
        }
      } catch (error) {
        console.error(
          "Follow data error:",
          error
        )
      }
    }

    fetchFollowData()
  }, [user])

  // ==========================================
  // FOLLOW / UNFOLLOW
  // ==========================================

  const handleFollow = async () => {
    setFollowError("")

    if (!currentUser) {
      setFollowError(
        "Please login to follow this user."
      )
      return
    }

    if (!user) {
      return
    }

    if (
      String(currentUser.id) ===
      String(user.id)
    ) {
      setFollowError(
        "You cannot follow yourself."
      )
      return
    }

    if (followLoading) {
      return
    }

    setFollowLoading(true)

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${user.id}/follow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            follower_id: currentUser.id,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setFollowError(
          data.message ||
            "Failed to follow user"
        )
        return
      }

      setFollowing(
        Boolean(data.following)
      )

      // Update follower count immediately
      if (data.following) {
        setFollowers(
          (previous) => previous + 1
        )
      } else {
        setFollowers(
          (previous) =>
            Math.max(0, previous - 1)
        )
      }
    } catch (error) {
      console.error(error)

      setFollowError(
        "Cannot connect to the server. Make sure the backend is running."
      )
    } finally {
      setFollowLoading(false)
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          Loading profile...
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
            User not found
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

  const isOwnProfile =
    currentUser &&
    user &&
    String(currentUser.id) ===
      String(user.id)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="border-b bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            BlogSpace
          </Link>

          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Home
          </Link>

        </div>

      </nav>


      {/* ==========================================
          PROFILE
      ========================================== */}

      <main className="mx-auto max-w-5xl px-6 py-10">

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


            {/* Name */}

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {user.full_name}
            </h1>


            {/* Username */}

            <p className="mt-1 text-gray-500">
              @{user.username}
            </p>


            {/* Email */}

            <p className="mt-2 text-gray-500">
              {user.email}
            </p>


            {/* ==========================================
                FOLLOW BUTTON
            ========================================== */}

            {!isOwnProfile && (

              <div className="mt-5">

                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`rounded-lg px-6 py-2.5 font-semibold transition ${
                    following
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {followLoading
                    ? "Loading..."
                    : following
                    ? "Following"
                    : "Follow"}
                </button>

                {followError && (
                  <p className="mt-2 text-sm text-red-600">
                    {followError}
                  </p>
                )}

              </div>

            )}


            {/* ==========================================
                PROFILE COUNTS
            ========================================== */}

            <div className="mt-6 flex gap-10">

              <div className="text-center">

                <p className="text-2xl font-bold text-gray-900">
                  {posts.length}
                </p>

                <p className="text-sm text-gray-500">
                  Posts
                </p>

              </div>


              <div className="text-center">

                <p className="text-2xl font-bold text-gray-900">
                  {followers}
                </p>

                <p className="text-sm text-gray-500">
                  Followers
                </p>

              </div>


              <div className="text-center">

                <p className="text-2xl font-bold text-gray-900">
                  {followingCount}
                </p>

                <p className="text-sm text-gray-500">
                  Following
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ==========================================
            USER POSTS
        ========================================== */}

        <section className="mt-8">

          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Posts by @{user.username}
          </h2>


          {posts.length === 0 ? (

            <div className="rounded-xl bg-white p-8 text-center shadow-sm">

              <h3 className="text-xl font-semibold text-gray-900">
                No posts yet
              </h3>

              <p className="mt-2 text-gray-600">
                This user hasn't published any posts yet.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {posts.map((post) => (

                <article
                  key={post.id}
                  className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  {/* Date */}

                  <p className="text-sm text-gray-500">

                    {post.created_at
                      ? new Date(
                          post.created_at
                        ).toLocaleDateString()
                      : ""}

                  </p>


                  {/* Title */}

                  <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    {post.title}
                  </h3>


                  {/* Content */}

                  <p className="mt-3 leading-7 text-gray-600">
                    {post.content ? getTextPreview(post.content, 200) : ""}
                  </p>


                  {/* Read More */}

                  <Link
                    to={`/posts/${post.id}`}
                    className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Read more →
                  </Link>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default Profile
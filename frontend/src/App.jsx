import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom"

import { useEffect, useState } from "react"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import TwoFactorSetup from "./TwoFactorSetup"
import Dashboard from "./pages/Dashboard"
import CreatePost from "./pages/CreatePost"
import PostDetails from "./pages/PostDetails"
import EditPost from "./pages/EditPost"
import Profile from "./pages/Profile"
import Explore from "./pages/Explore"
import { getTextPreview } from "./utils/content"

// =====================================================
// NAVBAR
// =====================================================

function Navbar() {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user")

    if (!storedUser || storedUser === "undefined") {
      return null
    }

    try {
      return JSON.parse(storedUser)
    } catch {
      return null
    }
  })

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user")

      if (!storedUser || storedUser === "undefined") {
        setUser(null)
        return
      }

      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    }

    window.addEventListener("storage", checkUser)

    return () => {
      window.removeEventListener("storage", checkUser)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")

    setUser(null)

    navigate("/")
  }

  return (
    <nav className="border-b bg-white">

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* LOGO */}

        <Link
          to="/"
          className="text-2xl font-bold text-blue-600"
        >
          BlogSpace
        </Link>


        {/* NAVIGATION */}

        <div className="flex items-center gap-2">

          {/* Explore */}

          <Link
            to="/explore"
            className="hidden rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 md:block"
          >
            Explore
          </Link>


          {/* Trending */}

          <Link
            to="/trending"
            className="hidden rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 md:block"
          >
            Trending
          </Link>


          {/* Categories */}

          <Link
            to="/categories"
            className="hidden rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 md:block"
          >
            Categories
          </Link>


          {/* About */}

          <Link
            to="/about"
            className="hidden rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 md:block"
          >
            About
          </Link>


          {user ? (
            <>

              {/* USER */}

              <span className="hidden text-sm font-medium text-gray-700 lg:block">
                Hi, {user.full_name}
              </span>


              {/* DASHBOARD */}

              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
              >
                Dashboard
              </Link>


              {/* CREATE POST */}

              <Link
                to="/create-post"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Create Post
              </Link>


              {/* LOGOUT */}

              <button
                onClick={handleLogout}
                className="rounded-lg border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>

            </>
          ) : (
            <>

              {/* LOGIN */}

              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>


              {/* SIGNUP */}

              <Link
                to="/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Sign Up
              </Link>

            </>
          )}

        </div>

      </div>

    </nav>
  )
}


// =====================================================
// HOME
// =====================================================

function Home() {

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

          setError(
            data.message || "Failed to load posts"
          )

          return
        }


        setPosts(data)

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

  }, [])


  // CHECK LOGIN

  const storedUser = localStorage.getItem("user")

  let loggedInUser = null

  if (
    storedUser &&
    storedUser !== "undefined"
  ) {

    try {
      loggedInUser = JSON.parse(storedUser)
    } catch {
      loggedInUser = null
    }

  }


  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />


      {/* HERO */}

      <header className="mx-auto max-w-6xl px-6 py-12">

        <div className="max-w-3xl">

          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Discover great stories.
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Read, write and share your ideas with the world.
          </p>


          <div className="mt-6 flex flex-wrap gap-3">

            <Link
              to="/explore"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Explore Stories
            </Link>

            {loggedInUser && (
              <Link
                to="/create-post"
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Write a Post
              </Link>
            )}

          </div>

        </div>

      </header>


      {/* QUICK SECTIONS */}

      <section className="mx-auto max-w-6xl px-6 pb-10">

        <div className="grid gap-5 md:grid-cols-3">

          <Link
            to="/trending"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <h2 className="text-xl font-bold text-gray-900">
              Trending Stories
            </h2>

            <p className="mt-2 text-gray-600">
              See what people are reading right now.
            </p>

          </Link>


          <Link
            to="/categories"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <h2 className="text-xl font-bold text-gray-900">
              Categories
            </h2>

            <p className="mt-2 text-gray-600">
              Explore technology, education, lifestyle and more.
            </p>

          </Link>


          <Link
            to="/about"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <h2 className="text-xl font-bold text-gray-900">
              About BlogSpace
            </h2>

            <p className="mt-2 text-gray-600">
              Learn more about our blogging platform.
            </p>

          </Link>

        </div>

      </section>


      {/* POSTS */}

      <main className="mx-auto max-w-6xl px-6 pb-12">

        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Latest Posts
        </h2>


        {/* LOADING */}

        {loading && (

          <div className="rounded-xl bg-white p-8 text-center shadow-sm">

            <p className="text-gray-600">
              Loading posts...
            </p>

          </div>

        )}


        {/* ERROR */}

        {!loading && error && (

          <div className="rounded-xl bg-white p-8 text-center shadow-sm">

            <p className="text-red-600">
              {error}
            </p>

          </div>

        )}


        {/* NO POSTS */}

        {!loading &&
          !error &&
          posts.length === 0 && (

            <div className="rounded-xl bg-white p-8 text-center shadow-sm">

              <h3 className="text-xl font-semibold text-gray-900">
                No posts yet
              </h3>

              <p className="mt-2 text-gray-600">
                There are no published posts yet.
              </p>


              {loggedInUser && (

                <Link
                  to="/create-post"
                  className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Create Your First Post
                </Link>

              )}

            </div>

          )}


        {/* POSTS GRID */}

        {!loading &&
          !error &&
          posts.length > 0 && (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {posts.map((post) => (

                <article
                  key={post.id}
                  className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* DATE */}

                  <p className="text-sm text-gray-500">

                    {post.created_at
                      ? new Date(
                          post.created_at
                        ).toLocaleDateString()
                      : ""}

                  </p>


                  {/* TITLE */}

                  <h3 className="mt-2 text-xl font-bold text-gray-900">
                    {post.title}
                  </h3>


                  {/* AUTHOR */}

                  {post.username && (

                    <Link
                      to={`/${post.username}`}
                      className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                    >
                      By @{post.username}
                    </Link>

                  )}


                  {/* CONTENT */}

                  <p className="mt-4 leading-6 text-gray-600">
                    {post.content ? getTextPreview(post.content, 150) : ""}
                  </p>


                  {/* READ MORE */}

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


// =====================================================
// TRENDING
// =====================================================

function Trending() {

  return (

    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">

        <h1 className="text-4xl font-bold text-gray-900">
          Trending
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          Discover popular stories on BlogSpace.
        </p>


        <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-gray-900">
            Trending Stories
          </h2>

          <p className="mt-3 text-gray-600">
            Popular posts will appear here.
          </p>


          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>

        </div>

      </main>

    </div>

  )
}


// =====================================================
// CATEGORIES
// =====================================================

function Categories() {

  return (

    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">

        <h1 className="text-4xl font-bold text-gray-900">
          Categories
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          Explore stories by category.
        </p>


        <div className="mt-8 grid gap-6 md:grid-cols-3">


          {/* TECHNOLOGY */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Technology
            </h2>

            <p className="mt-3 text-gray-600">
              Technology, programming and software stories.
            </p>

          </div>


          {/* LIFESTYLE */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Lifestyle
            </h2>

            <p className="mt-3 text-gray-600">
              Stories and ideas about everyday life.
            </p>

          </div>


          {/* EDUCATION */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Education
            </h2>

            <p className="mt-3 text-gray-600">
              Learning, education and useful knowledge.
            </p>

          </div>


          {/* BUSINESS */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Business
            </h2>

            <p className="mt-3 text-gray-600">
              Business, startups and entrepreneurship.
            </p>

          </div>


          {/* TRAVEL */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Travel
            </h2>

            <p className="mt-3 text-gray-600">
              Travel experiences and destinations.
            </p>

          </div>


          {/* NEWS */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              News
            </h2>

            <p className="mt-3 text-gray-600">
              Interesting news and current stories.
            </p>

          </div>

        </div>

      </main>

    </div>

  )
}


// =====================================================
// ABOUT
// =====================================================

function About() {

  return (

    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-12">

        <div className="rounded-xl bg-white p-8 shadow-sm">

          <h1 className="text-4xl font-bold text-gray-900">
            About BlogSpace
          </h1>


          <p className="mt-6 text-lg leading-8 text-gray-600">
            BlogSpace is a blogging platform where users can
            create, publish and share their stories with others.
          </p>


          <p className="mt-4 leading-7 text-gray-600">
            Readers can discover posts, explore different
            categories and visit individual author profiles.
          </p>


          <p className="mt-4 leading-7 text-gray-600">
            Users can also create their own posts and share
            their ideas with the BlogSpace community.
          </p>


          <Link
            to="/"
            className="mt-7 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>

        </div>

      </main>

    </div>

  )
}


// =====================================================
// APP
// =====================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* EXPLORE */}

        <Route
          path="/explore"
          element={<Explore />}
        />


        {/* TRENDING */}

        <Route
          path="/trending"
          element={<Trending />}
        />


        {/* CATEGORIES */}

        <Route
          path="/categories"
          element={<Categories />}
        />


        {/* ABOUT */}

        <Route
          path="/about"
          element={<About />}
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* SIGNUP */}

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* TWO FACTOR SETUP */}

        <Route
          path="/setup-2fa"
          element={<TwoFactorSetup />}
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* CREATE POST */}

        <Route
          path="/create-post"
          element={<CreatePost />}
        />


        {/* POST DETAILS */}

        <Route
          path="/posts/:id"
          element={<PostDetails />}
        />


        {/* EDIT POST */}

        <Route
          path="/posts/:id/edit"
          element={<EditPost />}
        />


        {/* PROFILE */}

        <Route
          path="/:username"
          element={<Profile />}
        />


      </Routes>

    </BrowserRouter>

  )
}


export default App
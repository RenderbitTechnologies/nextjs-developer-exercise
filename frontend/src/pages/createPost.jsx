import { useRef, useState } from "react"
import { useNavigate, Link } from "react-router-dom"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import LinkExtension from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"

import "./CreatePost.css"

function CreatePost() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const user = JSON.parse(localStorage.getItem("user"))

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit,

      LinkExtension.configure({
        openOnClick: false,
      }),

      Image,
    ],

    content: "",

    onUpdate: ({ editor }) => {
      setFormData((previous) => ({
        ...previous,
        content: editor.getHTML(),
      }))
    },
  })

  // ==========================================
  // LOGIN CHECK
  // ==========================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="rounded-xl bg-white p-8 text-center shadow-md">

          <h1 className="text-2xl font-bold text-gray-900">
            Login required
          </h1>

          <p className="mt-2 text-gray-600">
            You need to login before creating a post.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Login
          </Link>

        </div>
      </div>
    )
  }

  // ==========================================
  // TITLE CHANGE
  // ==========================================

  const handleTitleChange = (e) => {
    setFormData({
      ...formData,
      title: e.target.value,
    })
  }

  // ==========================================
  // CREATE SLUG
  // ==========================================

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  // ==========================================
  // ADD LINK
  // ==========================================

  const addLink = () => {
    if (!editor) {
      return
    }

    const url = window.prompt("Enter URL")

    if (!url) {
      return
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
      })
      .run()
  }

  // ==========================================
  // OPEN IMAGE SELECTOR
  // ==========================================

  const addImage = () => {
    if (!editor) {
      return
    }

    fileInputRef.current?.click()
  }

  // ==========================================
  // IMAGE SELECTED
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    // Only allow images
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.")
      return
    }

    // Limit image size to 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.")
      return
    }

    setError("")

    const reader = new FileReader()

    reader.onload = () => {
      const imageUrl = reader.result

      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
        })
        .run()
    }

    reader.onerror = () => {
      setError("Unable to read the selected image.")
    }

    reader.readAsDataURL(file)

    // Allow selecting the same image again later
    e.target.value = ""
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!formData.title.trim()) {
      setError("Please enter a post title.")
      return
    }

    if (!editor || editor.getText().trim() === "") {
      setError("Please write some content.")
      return
    }

    setLoading(true)

    try {
      const slug = createSlug(formData.title)

      const response = await fetch(
        "http://localhost:5000/api/posts",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: user.id,
            title: formData.title,
            slug: slug,
            content: formData.content,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message || "Failed to create post"
        )
        return
      }

      setSuccess("Post created successfully!")

      setFormData({
        title: "",
        content: "",
      })

      editor.commands.clearContent()

      setTimeout(() => {
        navigate("/")
      }, 1000)

    } catch (error) {
      console.error(error)

      setError(
        "Cannot connect to the server. Make sure the backend is running."
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="border-b bg-white">

        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">

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
          CREATE POST
      ========================================== */}

      <main className="mx-auto max-w-3xl px-6 py-10">

        <div className="rounded-xl bg-white p-8 shadow-md">

          <h1 className="text-3xl font-bold text-gray-900">
            Create a New Post
          </h1>

          <p className="mt-2 text-gray-600">
            Share your thoughts with the BlogSpace community.
          </p>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* ==========================================
                TITLE
            ========================================== */}

            <div>

              <label className="mb-2 block font-medium text-gray-700">
                Post Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter your post title"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>

            {/* ==========================================
                RICH EDITOR
            ========================================== */}

            <div>

              <label className="mb-2 block font-medium text-gray-700">
                Content
              </label>

              {/* HIDDEN IMAGE INPUT */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* TOOLBAR */}

              <div className="flex flex-wrap gap-2 rounded-t-lg border border-gray-300 bg-gray-50 p-2">

                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleBold().run()
                  }
                  className="rounded border px-3 py-1 font-bold hover:bg-gray-200"
                >
                  B
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleItalic().run()
                  }
                  className="rounded border px-3 py-1 italic hover:bg-gray-200"
                >
                  I
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({
                      level: 2,
                    }).run()
                  }
                  className="rounded border px-3 py-1 font-semibold hover:bg-gray-200"
                >
                  H2
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  className="rounded border px-3 py-1 hover:bg-gray-200"
                >
                  • List
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  className="rounded border px-3 py-1 hover:bg-gray-200"
                >
                  1. List
                </button>

                <button
                  type="button"
                  onClick={addLink}
                  className="rounded border px-3 py-1 hover:bg-gray-200"
                >
                  Link
                </button>

                {/* IMAGE */}

                <button
                  type="button"
                  onClick={addImage}
                  className="rounded border px-3 py-1 hover:bg-gray-200"
                >
                  Image
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().undo().run()
                  }
                  className="rounded border px-3 py-1 hover:bg-gray-200"
                >
                  Undo
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().redo().run()
                  }
                  className="rounded border px-3 py-1 hover:bg-gray-200"
                >
                  Redo
                </button>

              </div>

              {/* EDITOR */}

              <div className="rounded-b-lg border border-t-0 border-gray-300">

                <EditorContent
                  editor={editor}
                />

              </div>

            </div>

            {/* ==========================================
                PUBLISH
            ========================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Publishing..."
                : "Publish Post"}
            </button>

          </form>

        </div>

      </main>

    </div>
  )
}

export default CreatePost
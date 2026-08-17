import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // 2FA
  const [requires2FA, setRequires2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [pendingUserId, setPendingUserId] = useState(null)
  const [verifyLoading, setVerifyLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // ==========================================
  // NORMAL LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Login failed")
        return
      }

      // ==========================================
      // 2FA REQUIRED
      // ==========================================

      if (data.requires2FA) {
        setPendingUserId(data.userId)
        setRequires2FA(true)
        return
      }

      // Normal login without 2FA
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      navigate("/")

    } catch (error) {
      console.error(error)

      setError(
        "Cannot connect to the server. Make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // VERIFY 2FA DURING LOGIN
  // ==========================================

  const handleVerify2FA = async () => {
    if (twoFactorCode.length !== 6) {
      setError("Please enter the 6-digit authenticator code.")
      return
    }

    setError("")
    setVerifyLoading(true)

    try {
      const response = await fetch(
        "http://localhost:5000/api/2fa/login-verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: pendingUserId,
            token: twoFactorCode,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Invalid 2FA code")
        return
      }

      // Login completed
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      navigate("/")

    } catch (error) {
      console.error(error)

      setError(
        "Cannot connect to the server. Make sure the backend is running."
      )
    } finally {
      setVerifyLoading(false)
    }
  }

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = async (credentialResponse) => {
    setError("")
    setGoogleLoading(true)

    try {
      const response = await fetch(
        "http://localhost:5000/api/google-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message || "Google login failed"
        )
        return
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      navigate("/")

    } catch (error) {
      console.error(error)

      setError(
        "Cannot connect to the server. Make sure the backend is running."
      )
    } finally {
      setGoogleLoading(false)
    }
  }

  // ==========================================
  // 2FA SCREEN
  // ==========================================

  if (requires2FA) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">

          <h1 className="text-3xl font-bold text-gray-900">
            Two-Factor Authentication
          </h1>

          <p className="mt-2 text-gray-600">
            Enter the 6-digit code from your authenticator app.
          </p>

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={twoFactorCode}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, 6)

              setTwoFactorCode(value)
              setError("")
            }}
            placeholder="000000"
            className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-blue-500"
          />

          <button
            onClick={handleVerify2FA}
            disabled={
              verifyLoading ||
              twoFactorCode.length !== 6
            }
            className="mt-4 w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifyLoading
              ? "Verifying..."
              : "Verify & Login"}
          </button>

          <button
            onClick={() => {
              setRequires2FA(false)
              setPendingUserId(null)
              setTwoFactorCode("")
              setError("")
            }}
            className="mt-4 w-full text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Login
          </button>

        </div>

      </div>
    )
  }

  // ==========================================
  // NORMAL LOGIN PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">

        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back
        </h1>

        <p className="mt-2 text-gray-600">
          Login to your BlogSpace account.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* GOOGLE LOGIN */}

        <div className="mt-6 flex justify-center">

          {googleLoading ? (
            <p className="text-gray-600">
              Signing in with Google...
            </p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                setError("Google login failed")
              }}
            />
          )}

        </div>

        {/* DIVIDER */}

        <div className="my-6 flex items-center gap-3">

          <div className="h-px flex-1 bg-gray-300" />

          <span className="text-sm text-gray-500">
            OR
          </span>

          <div className="h-px flex-1 bg-gray-300" />

        </div>

        {/* NORMAL LOGIN */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>

            <label className="mb-1 block font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          <div>

            <label className="mb-1 block font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <p className="mt-6 text-center text-gray-600">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Sign up
          </Link>

        </p>

      </div>

    </div>
  )
}

export default Login
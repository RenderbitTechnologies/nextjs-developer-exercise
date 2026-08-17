import { useState } from "react"
import { Link } from "react-router-dom"

function TwoFactorSetup() {
  const user = JSON.parse(localStorage.getItem("user"))

  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [code, setCode] = useState("")
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  const setup2FA = async () => {
    if (!user) {
      setMessage("Please login first.")
      return
    }

    setMessage("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch(
        "http://localhost:5000/api/2fa/setup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || "Unable to setup 2FA")
        return
      }

      setQrCode(data.qrCode)
      setSecret(data.secret)

    } catch (error) {
      console.error(error)
      setMessage("Cannot connect to backend server.")
    } finally {
      setLoading(false)
    }
  }

  const verify2FA = async () => {
    if (!code || code.length !== 6) {
      setMessage("Please enter the 6-digit code.")
      return
    }

    setMessage("")
    setSuccess("")
    setVerifyLoading(true)

    try {
      const response = await fetch(
        "http://localhost:5000/api/2fa/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            token: code,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || "Invalid verification code.")
        return
      }

      setSuccess("Two-factor authentication enabled successfully!")
      setVerified(true)

    } catch (error) {
      console.error(error)
      setMessage("Cannot connect to backend server.")
    } finally {
      setVerifyLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="rounded-xl bg-white p-8 text-center shadow-md">

          <h1 className="text-2xl font-bold">
            Login required
          </h1>

          <p className="mt-2 text-gray-600">
            Please login before setting up 2FA.
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

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">

          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            BlogSpace
          </Link>

        </div>
      </nav>

      <main className="mx-auto max-w-xl px-6 py-10">

        <div className="rounded-xl bg-white p-8 shadow-md">

          <h1 className="text-3xl font-bold text-gray-900">
            Two-Factor Authentication
          </h1>

          <p className="mt-2 text-gray-600">
            Protect your BlogSpace account with an
            authenticator app.
          </p>

          {!qrCode && (
            <button
              onClick={setup2FA}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? "Generating..."
                : "Set Up 2FA"}
            </button>
          )}

          {message && (
            <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {message}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {qrCode && !verified && (
            <div className="mt-6">

              <h2 className="text-xl font-semibold">
                Step 1: Scan this QR code
              </h2>

              <p className="mt-2 text-gray-600">
                Open Google Authenticator and scan this QR code.
              </p>

              <div className="mt-6 flex justify-center">
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="h-64 w-64"
                />
              </div>

              <p className="mt-6 text-sm text-gray-600">
                If you cannot scan the QR code, enter this secret manually:
              </p>

              <div className="mt-2 rounded-lg bg-gray-100 p-4 text-center font-mono break-all">
                {secret}
              </div>

              {/* Verification */}

              <div className="mt-8 border-t pt-6">

                <h2 className="text-xl font-semibold">
                  Step 2: Enter your 6-digit code
                </h2>

                <p className="mt-2 text-gray-600">
                  Enter the current code shown in Google Authenticator.
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)

                    setCode(value)
                    setMessage("")
                  }}
                  placeholder="000000"
                  className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-blue-500"
                />

                <button
                  onClick={verify2FA}
                  disabled={verifyLoading || code.length !== 6}
                  className="mt-4 w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifyLoading
                    ? "Verifying..."
                    : "Verify & Enable 2FA"}
                </button>

              </div>

            </div>
          )}

          {verified && (
            <div className="mt-8 rounded-lg bg-green-50 p-5 text-center">

              <div className="text-4xl">
                ✓
              </div>

              <h2 className="mt-2 text-xl font-bold text-green-700">
                2FA Enabled
              </h2>

              <p className="mt-2 text-green-700">
                Your BlogSpace account is now protected with
                two-factor authentication.
              </p>

            </div>
          )}

        </div>

      </main>

    </div>
  )
}

export default TwoFactorSetup
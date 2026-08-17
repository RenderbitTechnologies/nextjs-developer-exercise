import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
  setMessage("Please complete the CAPTCHA.");
  return;
}

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  ...formData,
  captchaToken,
}),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to backend server.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">

        <h1 className="text-3xl font-bold text-gray-900">
          Create your account
        </h1>

        <p className="mt-2 text-gray-600">
          Join BlogSpace and start writing.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Full Name
            </label>

            <input
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Username
            </label>

            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Email
            </label>

            <input
              name="email"
              type="email"
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
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-sm text-gray-500">
              Must contain at least 8 characters.
            </p>
          </div>
          <div className="flex justify-center">
  <ReCAPTCHA
    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
    onChange={(token) => setCaptchaToken(token)}
    onExpired={() => setCaptchaToken(null)}
  />
</div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {message && (
            <p className="text-center text-sm font-medium text-blue-600">
              {message}
            </p>
          )}

        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;
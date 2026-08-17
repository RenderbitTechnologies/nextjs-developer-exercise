import React from "react"
import ReactDOM from "react-dom/client"
import { GoogleOAuthProvider } from "@react-oauth/google"
import App from "./App"
import "./index.css"

const GOOGLE_CLIENT_ID ="989395104099-o4v4is8up6kr4jrqr4h9dvrblk8ejems.apps.googleusercontent.com"
console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID)
                         
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)
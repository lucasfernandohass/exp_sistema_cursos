import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import App from "./App"
import { AuthProvider } from "./context/AuthContext"

import "./styles/global.css"
import "./styles/course-page.css"
import "./styles/navbar.css"
import "./styles/hero.css"
import "./styles/courses.css"
import "./styles/auth.css"
import "./styles/dashboard.css"
import "./styles/sidebar.css"
import "./styles/footer.css"
import "./styles/darkmode.css"
import "./styles/responsive.css"
import "./styles/admin.css"

document.documentElement.classList.toggle(
  "dark",
  localStorage.getItem("theme") === "dark"
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

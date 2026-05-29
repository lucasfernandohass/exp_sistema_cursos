import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import App from "./App"
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
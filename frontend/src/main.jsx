import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import App from "./App"
import { AuthProvider } from "./context/AuthContext"

import "./styles/global.css"
import "./styles/navbar.css"
import "./styles/hero.css"
import "./styles/courses.css"
import "./styles/curso-detalhe.css"
import "./styles/sobre.css"
import "./styles/contato.css"
import "./styles/auth.css"
import "./styles/dashboard.css"
import "./styles/sidebar.css"
import "./styles/course-page.css"
import "./styles/footer.css"
import "./styles/darkmode.css"
import "./styles/responsive.css"
import "./styles/admin.css"
import "./styles/aula.css"
import "./styles/toast.css"
import "./styles/admin-dashboard.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
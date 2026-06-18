import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import App from "./App"
import { AuthProvider } from "./context/AuthContext"

// CSS GLOBAIS
import "./styles/global.css"
import "./styles/darkmode.css"
import "./styles/responsive.css"
import "./styles/navbar.css"
import "./styles/footer.css"
import "./styles/auth.css"
import "./styles/toast.css"
import "./styles/admin.css"
import "./styles/professor.css"
import "./styles/dashboard.css"
import "./styles/dashboard-navbar.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
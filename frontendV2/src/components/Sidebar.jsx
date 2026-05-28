import { Link, useLocation, useNavigate } from "react-router-dom"

export default function Sidebar() {

  const location = useLocation()
  const navigate = useNavigate()

  function handleLogout() {

    // remove login salvo
    localStorage.removeItem("token")

    // volta para login
    navigate("/")
  }

  return (
    <aside className="sidebar">

      <div className="sidebar-top">

        <Link to="/dashboard" className="sidebar-logo">

          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M22 10L12 15L2 10L12 5L22 10Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M22 10V14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <h2>Aprenda+</h2>

        </Link>

        <nav className="sidebar-links">

          <Link
            to="/dashboard"
            className={
              location.pathname === "/dashboard"
                ? "active"
                : ""
            }
          >
            Home
          </Link>

          <Link
            to="/matriculados"
            className={
              location.pathname === "/matriculados"
                ? "active"
                : ""
            }
          >
            Cursos Matriculados
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            Sair
          </button>

        </div>

      </div>

    </aside>
  )
}
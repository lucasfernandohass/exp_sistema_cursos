import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar desktop-nav">
        <div className="container nav-container">

          <div className="nav-left">

            <div className="logo">
              <Link to="/" className="logo">
                <div className="logo-icon">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                </div>

                <span className="logo-text">Aprenda+</span>
              </Link>
            </div>

            <div className="nav-links">
            </div>

          </div>

          <div className="nav-actions">

            <Link to="/login">
              <button className="btn-login">
                Login
              </button>
            </Link>

            <Link to="/register">
              <button className="btn-primary">
                Cadastrar
              </button>
            </Link>

          </div>

        </div>
      </nav>
    </>
  )
}
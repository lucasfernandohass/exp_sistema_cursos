import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"

import { useAuth } from "../context/AuthContext"
import { login } from "../api"
import ThemeToggle from "../components/ThemeToggle"

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e) {
    e.preventDefault()
    setError("")

    if (!email.trim() || !senha) {
      setError("Preencha e-mail e senha.")
      return
    }

    try {
      setLoading(true)
      const res = await login(email.trim(), senha)

      signIn({
        token: res.token,
        tipo: res.tipo,
        id: res.id,
        nome: res.nome,
        email: res.email,
      })

      if (res.tipo === "ADMINISTRADOR") {
        navigate("/admin/cursos")
      } else if (res.tipo === "PROFESSOR") {
        navigate("/professor/dashboard")
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err.message || "Falha no login. Verifique suas credenciais.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">

        {/* LOGO */}
        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">
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
          </span>
          Aprenda+
        </Link>

        {/* FORM */}
        <form className="auth-form" onSubmit={handleLogin}>

          <h2>Entrar</h2>

          {/* ERRO GLOBAL */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError("") }}
            autoComplete="email"
            disabled={loading}
          />

          {/* SENHA */}
          <div className="input-with-icon">
            <input
              type={showSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setError("") }}
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setShowSenha((v) => !v)}
              aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {showSenha ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* SUBMIT */}
          <button
            className="btn-primary auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="auth-switch">
            Não tem conta?{" "}
            <Link to="/registrar">
              <span>Criar conta</span>
            </Link>
          </p>

        </form>

      </div>

      {/* THEME TOGGLE */}
      <ThemeToggle />
    </div>
  )
}
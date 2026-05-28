import { useNavigate, Link } from "react-router-dom"
import { login } from "../api"

export default function Login() {

  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()

    const email = e.target[0].value
    const password = e.target[1].value

    try {
      const res = await login(email, password)

      // salva token e dados do usuário
      const user = {
        token: res.token,
        tipo: res.tipo,
        id: res.id,
        nome: res.nome,
        email: res.email,
      }

      localStorage.setItem("user", JSON.stringify(user))

      // redireciona
      navigate("/dashboard")
    } catch (err) {
      alert("Falha no login: " + err.message)
    }
  }

  return (
    <div className="auth-container">

      <div className="auth-box">

        <Link to="/" className="auth-logo">
          Aprenda+
        </Link>

        <form className="auth-form" onSubmit={handleLogin}>

          <h2>Entrar</h2>

          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Senha" />

          <button className="btn-primary auth-btn">
            Entrar
          </button>

          <p className="auth-switch">
            Não tem conta?{" "}
            <Link to="/register">
              <span>Criar conta</span>
            </Link>
          </p>

        </form>

      </div>

    </div>
  )
}
import { useNavigate, Link } from "react-router-dom"

export default function Login() {

  const navigate = useNavigate()

  function handleLogin(e) {
    e.preventDefault()

    const email = e.target[0].value
    const password = e.target[1].value

    // pega usuário salvo no register
    const user = JSON.parse(localStorage.getItem("user"))

    // validação simples
    if (!user || user.email !== email || user.password !== password) {
      alert("Email ou senha inválidos")
      return
    }

    // marca como logado
    localStorage.setItem("logged", "true")

    // redireciona
    navigate("/dashboard")
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
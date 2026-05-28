import { Link, useNavigate } from "react-router-dom"

export default function Register() {

  const navigate = useNavigate()

  function handleRegister(e) {
    e.preventDefault()

    const name = e.target[0].value
    const email = e.target[1].value
    const password = e.target[2].value
    const confirm = e.target[3].value

    // validação de senha
    if (password !== confirm) {
      alert("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      alert("Senha precisa ter pelo menos 6 caracteres")
      return
    }

    // salva usuário
    const user = {
      name,
      email,
      password
    }

    localStorage.setItem("user", JSON.stringify(user))

    alert("Conta criada com sucesso!")

    // vai para login
    navigate("/login")
  }

  return (
    <div className="auth-container">

      <div className="auth-box">

        <Link to="/" className="auth-logo">
          Aprenda+
        </Link>

        <form className="auth-form" onSubmit={handleRegister}>

          <h2>Criar conta</h2>

          <input type="text" placeholder="Nome" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Senha" />
          <input type="password" placeholder="Confirmar senha" />

          <button className="btn-primary auth-btn">
            Cadastrar
          </button>

          <p className="auth-switch">
            Já tem conta?{" "}
            <Link to="/login">
              <span>Entrar</span>
            </Link>
          </p>

        </form>

      </div>

    </div>
  )
}
import { useNavigate } from "react-router-dom"

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="hero">
      <div className="container hero-container">

        {/* LADO ESQUERDO */}
        <div className="hero-content">
          <h1>Aprenda novas habilidades online</h1>
          <p className="hero-description">
            Milhares de cursos em diversas áreas para você se desenvolver profissionalmente
          </p>
          <button
            className="btn-primary hero-btn"
            onClick={() => navigate("/cursos")}
          >
            Explorar Cursos
          </button>
        </div>

        {/* CAIXA DESTAQUE */}
        <div className="hero-card">
          <div className="hero-card-inner">
            <div className="hero-icon">
              <svg
                width="120"
                height="90"
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="hero-title">Aprenda+</h2>
            <p className="hero-subtitle">Sua plataforma de educação online</p>
          </div>
        </div>

      </div>
    </section>
  )
}
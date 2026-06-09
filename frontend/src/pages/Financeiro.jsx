import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import ThemeToggle from "../components/ThemeToggle"

import { detalharCurso, matricular, detalharMatricula } from "../api"
import { useAuth } from "../context/AuthContext"

export default function Financeiro() {
  const { cursoId } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [curso, setCurso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolledSuccess, setEnrolledSuccess] = useState(false)

  const [modalidade, setModalidade] = useState("AVISTA")
  const [parcelas, setParcelas] = useState(2)

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        setError(null)
        const data = await detalharCurso(cursoId)
        setCurso(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (cursoId) carregar()
  }, [cursoId])

  useEffect(() => {
    let ignore = false
    async function check() {
      if (!user || !cursoId || loading || !curso) {
        setCheckingEnrollment(false)
        return
      }
      try {
        await detalharMatricula(user.id, cursoId, token)
        if (!ignore) setIsEnrolled(true)
      } catch {
        if (!ignore) setIsEnrolled(false)
      } finally {
        if (!ignore) setCheckingEnrollment(false)
      }
    }
    check()
    return () => { ignore = true }
  }, [user, cursoId, token, loading, curso])

  async function handleEnroll() {
    try {
      setEnrolling(true)
      setError(null)
      await matricular(
        {
          cursoId: Number(cursoId),
          modalidadePagamento: modalidade,
          numeroParcelas: modalidade === "PARCELADO" ? parcelas : 1,
        },
        token
      )
      setEnrolledSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnrolling(false)
    }
  }

  function formatarPreco(preco) {
    if (!preco && preco !== 0) return "—"
    if (preco === 0) return "Grátis"
    return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const precoNum = Number(curso?.preco) || 0

  function renderBody() {
    if (loading) {
      return (
        <>
          <div className="skeleton" style={{ height: 16, width: "65%", borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 14, width: "35%", borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 44, borderRadius: 10 }} />
        </>
      )
    }

    if (error && !curso) {
      return (
        <div className="financeiro-body-center">
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/cursos")}>
            Ver todos os cursos
          </button>
        </div>
      )
    }

    if (checkingEnrollment) {
      return (
        <div className="financeiro-body-center">
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", margin: 0 }}>
            Verificando matrícula…
          </p>
        </div>
      )
    }

    if (isEnrolled) {
      return (
        <div className="financeiro-confirmation">
          <div className="financeiro-confirmation-banner">
            {curso.urlBanner || curso.url_banner ? (
              <img src={curso.urlBanner || curso.url_banner} alt="" />
            ) : (
              <div className="financeiro-confirmation-banner-placeholder">
                <span className="financeiro-card-banner-text">
                  {curso.nome
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
            )}
            <div className="financeiro-confirmation-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Já matriculado</span>
            </div>
          </div>
          <div className="financeiro-confirmation-body">
            <h2>{curso.nome}</h2>
            <p>Você já está matriculado neste curso.</p>
            <button className="btn-primary" onClick={() => navigate("/painel-aluno")}>
              Acessar Meus Cursos
            </button>
          </div>
        </div>
      )
    }

    if (enrolledSuccess) {
      return (
        <div className="financeiro-confirmation">
          <div className="financeiro-confirmation-banner">
            {curso.urlBanner || curso.url_banner ? (
              <img src={curso.urlBanner || curso.url_banner} alt="" />
            ) : (
              <div className="financeiro-confirmation-banner-placeholder">
                <span className="financeiro-card-banner-text">
                  {curso.nome
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
            )}
            <div className="financeiro-confirmation-badge success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Matrícula confirmada!</span>
            </div>
          </div>
          <div className="financeiro-confirmation-body">
            <h2>{curso.nome}</h2>
            <p>Bem-vindo ao curso! Sua matrícula foi confirmada.</p>
            <button className="btn-primary" onClick={() => navigate("/painel-aluno")}>
              Acessar Meus Cursos
            </button>
          </div>
        </div>
      )
    }

    return (
      <>
        <div className="financeiro-header">
          <h2 className="financeiro-nome">{curso.nome}</h2>
          <span className="financeiro-preco">{formatarPreco(curso.preco)}</span>
        </div>

        {precoNum === 0 && <span className="financeiro-gratis">Grátis</span>}

        {precoNum > 0 && (
          <>
            <div className="payment-options">
              <div
                className={`payment-option${modalidade === "AVISTA" ? " selected" : ""}`}
                onClick={() => setModalidade("AVISTA")}
              >
                <input type="radio" name="modalidade" checked={modalidade === "AVISTA"} readOnly />
                <span>À vista</span>
              </div>
              <div
                className={`payment-option${modalidade === "PARCELADO" ? " selected" : ""}`}
                onClick={() => setModalidade("PARCELADO")}
              >
                <input type="radio" name="modalidade" checked={modalidade === "PARCELADO"} readOnly />
                <span>Parcelado</span>
              </div>
            </div>

            {modalidade === "PARCELADO" && (
              <div className="payment-parcelas">
                <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}>
                  {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                    <option key={n} value={n}>
                      {n}x de {formatarPreco(precoNum / n)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {error && <div className="financeiro-erro">{error}</div>}

        <button className="btn-primary" onClick={handleEnroll} disabled={enrolling}>
          {enrolling
            ? "Matriculando…"
            : precoNum === 0
              ? "Confirmar matrícula gratuita"
              : "Confirmar matrícula"}
        </button>
      </>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main financeiro-main">
        <div className="financeiro-card">
          {curso && (
            <div className="financeiro-card-banner">
              <span className="financeiro-card-banner-text">
                {curso.nome
                  ?.split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
          )}
          <div className="financeiro-card-body">{renderBody()}</div>
        </div>
      </main>

      <ThemeToggle />
    </div>
  )
}

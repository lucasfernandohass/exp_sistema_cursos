import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ThemeToggle from "../components/ThemeToggle"
import ConfirmModal from "../components/ConfirmModal"

import { detalharCurso, matricular } from "../api"
import { useAuth } from "../context/AuthContext"

import "../styles/courses.css";
import "../styles/curso-detalhe.css";

export default function Curso() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, isAluno, isProfessor, isAdmin, token } = useAuth()

  const [curso, setCurso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollMessage, setEnrollMessage] = useState(null)

  /* =========================
     CARREGAR CURSO
  ========================= */

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        setError(null)
        const data = await detalharCurso(id)
        setCurso(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [id])

  /* =========================
     HELPERS
  ========================= */

  function formatarPreco(preco) {
    if (!preco && preco !== 0) return "—"
    if (preco === 0) return "Grátis"
    return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  function formatarDuracao(dur) {
    if (!dur) return null
    const partes = dur.split(":")
    if (partes.length === 3 && partes[0] === "00") return `${partes[1]}min`
    return dur
  }

  function totalCargaHoraria(aulas) {
    if (!aulas?.length) return null
    return aulas.reduce((acc, a) => {
      if (!a.duracao) return acc
      const [h, m] = a.duracao.split(":").map(Number)
      return acc + h * 60 + m
    }, 0)
  }

  function minutosParaTexto(min) {
    if (!min) return null
    const h = Math.floor(min / 60)
    const m = min % 60
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
  }

  /* =========================
     VERIFICAR SE PODE MATRICULAR
  ========================= */
  function podeMatricular() {
    if (!isAuthenticated) return false
    return isAluno
  }

  function getBotaoTexto() {
    if (!isAuthenticated) return "Matricular-se"
    if (isAdmin) return "Administradores não podem se matricular"
    if (isProfessor) return "Professores não podem se matricular"
    if (isAluno) return "Inscreva-se"
    return "Matricular-se"
  }

  function getBotaoAcao() {
    if (!isAuthenticated) return () => navigate("/registrar")
    if (isAdmin || isProfessor) return null // não faz nada
    if (isAluno) return () => setShowConfirmModal(true)
    return () => navigate("/registrar")
  }

  /* =========================
     CONFIRMAR MATRÍCULA
  ========================= */
  async function handleConfirmEnrollment() {
    try {
      setEnrolling(true)
      setError(null)
      setEnrollMessage(null)

      const matricula = await matricular(
        {
          cursoId: Number(id),
          modalidadePagamento: "AVISTA",
          numeroParcelas: 1,
        },
        token
      )

      setShowConfirmModal(false)

      if (matricula.statusPagamento === "PAGO") {
        setEnrollMessage("Inscrição confirmada com sucesso. Curso gratuito liberado.")
        window.setTimeout(() => navigate("/painel-aluno"), 900)
        return
      }

      navigate(`/painel-aluno/financeiro/${id}`)
    } catch (err) {
      setError(err.message)
      setShowConfirmModal(false)
    } finally {
      setEnrolling(false)
    }
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="curso-detalhe-page">
        <Navbar />
        <div className="curso-banner-skeleton skeleton" />
        <div className="container" style={{ padding: "2.5rem 2rem" }}>
          <div className="skeleton" style={{ height: 36, width: "50%", marginBottom: 16, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 20, width: "80%", marginBottom: 10, borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 20, width: "65%", borderRadius: 6 }} />
        </div>
        <Footer />
      </div>
    )
  }

  /* =========================
     ERRO / NÃO ENCONTRADO
  ========================= */

  if ((error && !curso) || !curso) {
    return (
      <div className="curso-detalhe-page">
        <Navbar />
        <div className="container courses-error" style={{ padding: "5rem 2rem" }}>
          <p>⚠️ {error ?? "Curso não encontrado."}</p>
          <button className="btn-primary" onClick={() => navigate("/cursos")}>
            Ver todos os cursos
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const totalMin = totalCargaHoraria(curso.videoAulas)

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="curso-detalhe-page">
      <Navbar />

      {/* =========================
          BANNER
      ========================= */}
      <div className="curso-detalhe-banner-wrap">
        {curso.urlBanner ? (
          <img
            src={curso.urlBanner}
            alt={curso.nome}
            className="curso-detalhe-banner"
          />
        ) : (
          <div className="curso-detalhe-banner-placeholder">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
              <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 10V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <div className="curso-detalhe-banner-overlay" />

        <div className="curso-detalhe-banner-content container">
          <span className="curso-detalhe-tag">Curso</span>
          <h1 className="curso-detalhe-nome">{curso.nome}</h1>
          {curso.descricao && (
            <p className="curso-detalhe-descricao-banner">{curso.descricao}</p>
          )}
        </div>
      </div>

      {/* =========================
          CONTEÚDO PRINCIPAL
      ========================= */}
      <br />
      <div className="container curso-detalhe-body">

        <div className="curso-detalhe-main">

          {curso.ementa && (
            <section className="curso-detalhe-section">
              <h2 className="curso-detalhe-section-title">Sobre o curso</h2>
              <p className="curso-detalhe-ementa">{curso.ementa}</p>
            </section>
          )}

          {curso.videoAulas?.length > 0 && (
            <section className="curso-detalhe-section">
              <h2 className="curso-detalhe-section-title">
                Conteúdo do curso
                <span className="curso-detalhe-aulas-count">
                  {curso.videoAulas.length} aula{curso.videoAulas.length !== 1 ? "s" : ""}
                  {totalMin ? ` · ${minutosParaTexto(totalMin)}` : ""}
                </span>
              </h2>

              <div className="curso-detalhe-aulas">
                {curso.videoAulas.map((aula, idx) => (
                  <div key={aula.id} className="curso-detalhe-aula-item">
                    <div className="curso-detalhe-aula-num">{idx + 1}</div>
                    <div className="curso-detalhe-aula-info">
                      <span className="curso-detalhe-aula-titulo">{aula.titulo}</span>
                    </div>
                    {aula.duracao && (
                      <span className="curso-detalhe-aula-dur">
                        {formatarDuracao(aula.duracao)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* CARD LATERAL */}
        <aside className="curso-detalhe-aside">
          <div className="curso-detalhe-card">

            <div className="curso-detalhe-preco">
              {formatarPreco(curso.preco)}
            </div>

            <ul className="curso-detalhe-stats">
              {curso.cargaHoraria > 0 && (
                <li>
                  <span className="curso-stat-icon"></span>
                  <span>- {curso.cargaHoraria}h de conteúdo</span>
                </li>
              )}
              {curso.numeroAulas > 0 && (
                <li>
                  <span className="curso-stat-icon"></span>
                  <span>- {curso.numeroAulas} aula{curso.numeroAulas !== 1 ? "s" : ""}</span>
                </li>
              )}
              {curso.notaAvaliacao > 0 && (
                <li>
                  <span className="curso-stat-icon">⭐</span>
                  <span>Avaliação {curso.notaAvaliacao.toFixed(1)} / 5.0</span>
                </li>
              )}
              <li>
                <span className="curso-stat-icon"></span>
                <span>- Certificado de conclusão</span>
              </li>
              <li>
                <span className="curso-stat-icon"></span>
                <span>- Acesso em qualquer dispositivo</span>
              </li>
            </ul>

            {/* CTA - VERIFICA SE PODE MATRICULAR */}
            {isAuthenticated && !isAluno ? (
              // Admin ou Professor - mostra mensagem de bloqueio
              <div className="curso-detalhe-bloqueado">
                <button
                  className="btn-secondary curso-detalhe-cta"
                  disabled={true}
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                >
                  {isAdmin ? "Administradores não podem se matricular" : "Professores não podem se matricular"}
                </button>
                <p className="curso-detalhe-login-hint">
                  {isAdmin ? "Acesse o painel administrativo para gerenciar cursos." : "Acesse seu painel de professor para gerenciar seus cursos."}
                </p>
              </div>
            ) : isAuthenticated && isAluno ? (
              // Aluno - mostra botão de matrícula
              <>
                <button
                  className="btn-primary curso-detalhe-cta"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={enrolling}
                >
                  {enrolling ? "Inscrevendo..." : "Inscreva-se"}
                </button>
                {enrollMessage && (
                  <p className="curso-detalhe-feedback success">{enrollMessage}</p>
                )}
                {error && (
                  <p className="curso-detalhe-feedback error">{error}</p>
                )}
              </>
            ) : (
              // Não autenticado - redireciona para registro
              <>
                <button
                  className="btn-primary curso-detalhe-cta"
                  onClick={() => navigate("/registrar")}
                >
                  Matricular-se
                </button>
                <p className="curso-detalhe-login-hint">
                  Já tem conta?{" "}
                  <span
                    className="curso-detalhe-login-link"
                    onClick={() => navigate("/login")}
                  >
                    Fazer login
                  </span>
                </p>
              </>
            )}

          </div>
        </aside>

      </div>
      <br />
      <Footer />
      <ThemeToggle />
      <ConfirmModal
        visible={showConfirmModal}
        title="Confirmar inscrição"
        message="Deseja realmente se inscrever neste curso?"
        onConfirm={handleConfirmEnrollment}
        onCancel={() => !enrolling && setShowConfirmModal(false)}
      />
    </div>
  )
}
import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import ConfirmModal from "../components/ConfirmModal"
import Toast from "../components/Toast"
import ThemeToggle from "../components/ThemeToggle"

import { useAuth } from "../context/AuthContext"
import { listarMatriculas, cancelarMatricula } from "../api"

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token } = useAuth()

  const [matriculas, setMatriculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    cursoId: null,
    nomeCurso: "",
  })
  const [canceling, setCanceling] = useState(false)

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" })
  const [successBanner, setSuccessBanner] = useState(
    location.state?.enrolled ? location.state.cursoNome : null
  )

  /* =========================
     CARREGAR MATRÍCULAS
  ========================= */

  const fetchMatriculas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listarMatriculas(user.id, token)
      setMatriculas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user.id, token])

  useEffect(() => {
    fetchMatriculas()
  }, [fetchMatriculas])

  useEffect(() => {
    if (!successBanner) return
    const timer = setTimeout(() => setSuccessBanner(null), 5000)
    return () => clearTimeout(timer)
  }, [successBanner])

  /* =========================
     CANCELAR MATRÍCULA
  ========================= */

  function handleCancelClick(matricula) {
    setConfirmModal({
      visible: true,
      cursoId: matricula.cursoId,
      nomeCurso: matricula.nomeCurso,
    })
  }

  async function handleConfirmCancel() {
    const { cursoId } = confirmModal
    setConfirmModal((prev) => ({ ...prev, visible: false }))
    try {
      setCanceling(true)
      await cancelarMatricula(user.id, cursoId, token)
      setMatriculas((prev) => prev.filter((m) => m.cursoId !== cursoId))
    } catch (err) {
      setToast({ visible: true, message: "Erro ao cancelar matrícula: " + err.message, type: "error" })
    } finally {
      setCanceling(false)
    }
  }

  /* =========================
     HELPERS
  ========================= */

  function progressPercent(m) {
    if (!m.totalAulas) return 0
    return Math.round((m.aulasConcluidas / m.totalAulas) * 100)
  }

  function formatDate(iso) {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
    })
  }

  function greeting() {
    const h = new Date().getHours()
    if (h < 12) return "Bom dia"
    if (h < 18) return "Boa tarde"
    return "Boa noite"
  }

  function getInitials(name) {
    if (!name) return "?"
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  }

  const stats = (() => {
    const total = matriculas.length
    const concluidos = matriculas.filter(m => progressPercent(m) === 100).length
    const andamento = total - concluidos
    return { total, andamento, concluidos }
  })()

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div className="skeleton" style={{ height: 36, width: 280, borderRadius: 10, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 20, width: 200, borderRadius: 8 }} />
          </div>
          <div className="dashboard-content">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 140, borderRadius: 12 }} />
                <div className="card-content">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-btn" style={{ marginTop: 12 }} />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  /* =========================
     ERRO
  ========================= */

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="courses-error">
            <p>⚠️ {error}</p>
            <button className="btn-primary" onClick={fetchMatriculas}>Tentar novamente</button>
          </div>
        </main>
      </div>
    )
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* HEADER */}
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            {greeting()}, {user.nome?.split(" ")[0]}! 👋
          </h1>
          <p className="dashboard-subtitle">
            {matriculas.length > 0
              ? `Você tem ${matriculas.length} curso${matriculas.length > 1 ? "s" : ""} em andamento.`
              : "Explore o catálogo e comece a aprender."}
          </p>
        </div>

        {/* BANNER DE SUCESSO (após matrícula) */}
        {successBanner && (
          <div className="dashboard-banner-success">
            <span className="dashboard-banner-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span>Matrícula em <strong>"{successBanner}"</strong> confirmada! Aproveite o curso.</span>
            <button className="dashboard-banner-close" onClick={() => setSuccessBanner(null)}>✕</button>
          </div>
        )}

        {/* STATS ROW */}
        {matriculas.length > 0 && (
          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <span className="dashboard-stat-number">{stats.total}</span>
              <span className="dashboard-stat-label">Cursos</span>
            </div>
            <div className="dashboard-stat-card">
              <span className="dashboard-stat-number">{stats.andamento}</span>
              <span className="dashboard-stat-label">Em andamento</span>
            </div>
            <div className="dashboard-stat-card">
              <span className="dashboard-stat-number">{stats.concluidos}</span>
              <span className="dashboard-stat-label">Concluídos</span>
            </div>
          </div>
        )}

        {/* VAZIO */}
        {matriculas.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 10V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <h2>Nenhum curso matriculado</h2>
            <p>Explore nosso catálogo e comece a aprender hoje mesmo!</p>
            <button className="btn-primary" onClick={() => navigate("/cursos")}>
              Ver Catálogo
            </button>
          </div>
        ) : (

          /* GRID DE MATRÍCULAS */
          <div className="dashboard-content">
            {matriculas.map((m) => {
              const progress = progressPercent(m)

              return (
                <div key={m.cursoId} className="card">

                  {/* BANNER */}
                  {m.urlBanner ? (
                    <img
                      src={m.urlBanner}
                      alt={m.nomeCurso}
                      className="course-image"
                      style={{ borderRadius: "12px 12px 0 0" }}
                    />
                  ) : (
                    <div className="course-image-placeholder" style={{ height: 130, borderRadius: "12px 12px 0 0" }}>
                      <span className="course-initials">{getInitials(m.nomeCurso)}</span>
                    </div>
                  )}

                  <div className="card-content">

                    {/* NOME + PROFESSOR */}
                    <h3>{m.nomeCurso}</h3>
                    <p className="course-meta">{m.nomeProfessor}</p>

                    {/* PROGRESSO */}
                    <div className="enrolled-progress-header">
                      <span className="course-meta">Progresso</span>
                      <span className="enrolled-progress-pct">{progress}%</span>
                    </div>
                    <div className="dashboard-progress-bar">
                      <div className="dashboard-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="course-meta" style={{ fontSize: "0.8rem" }}>
                      {m.aulasConcluidas} de {m.totalAulas} aulas concluídas
                    </p>

                    {/* MÉDIA */}
                    {m.mediaFinal != null && (
                      <p className="enrolled-media">
                        Média: <strong>{m.mediaFinal.toFixed(1)}</strong>
                      </p>
                    )}

                    {/* PAGAMENTO */}
                    <div className="enrolled-payment-row">
                      <span className={`payment-status payment-status--${m.statusPagamento?.toLowerCase()}`}>
                        {m.statusPagamento}
                      </span>
                      <span className="course-meta" style={{ fontSize: "0.78rem" }}>
                        {m.modalidadePagamento === "PARCELADO"
                          ? `${m.numeroParcelas}x parcelado`
                          : "À vista"}
                      </span>
                    </div>

                    {/* DATA */}
                    <p className="course-meta" style={{ fontSize: "0.78rem" }}>
                      Matriculado em {formatDate(m.dataMatricula)}
                    </p>

                    {/* CERTIFICADO */}
                    {m.certificadoDisponivel && (
                      <p className="enrolled-certificate">Certificado disponível!</p>
                    )}

                  </div>

                  {/* AÇÕES */}
                  <div className="enrolled-actions">
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/curso/${m.cursoId}`)}
                    >
                      Assistir aulas
                    </button>
                    <button
                      className="btn-outline enrolled-remove-btn"
                      onClick={() => handleCancelClick(m)}
                      disabled={canceling}
                    >
                      Cancelar
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </main>

      <ThemeToggle />

      {/* MODAL CANCELAMENTO */}
      <ConfirmModal
        visible={confirmModal.visible}
        title="Cancelar matrícula"
        message={`Deseja cancelar sua matrícula em "${confirmModal.nomeCurso}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />

      {/* TOAST */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  )
}
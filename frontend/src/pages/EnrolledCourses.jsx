import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import ConfirmModal from "../components/ConfirmModal"

import { useAuth } from "../context/AuthContext"
import { listarMatriculas, cancelarMatricula, detalharCurso } from "../api"

export default function EnrolledCourses() {
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [matriculas, setMatriculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // modal de cancelamento
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    cursoId: null,
    nomeCurso: "",
  })
  const [canceling, setCanceling] = useState(false)

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

  /* =========================
     CANCELAR MATRÍCULA
  ========================= */

  function handleRemoveClick(matricula) {
    setConfirmModal({
      visible: true,
      cursoId: matricula.cursoId,
      nomeCurso: matricula.nomeCurso,
    })
  }

  async function handleConfirmRemove() {
    const { cursoId } = confirmModal
    setConfirmModal((prev) => ({ ...prev, visible: false }))

    try {
      setCanceling(true)
      await cancelarMatricula(user.id, cursoId, token)
      setMatriculas((prev) => prev.filter((m) => m.cursoId !== cursoId))
    } catch (err) {
      alert("Erro ao cancelar matrícula: " + err.message)
    } finally {
      setCanceling(false)
    }
  }

  /* =========================
     HELPERS
  ========================= */

  function progressPercent(matricula) {
    if (!matricula.totalAulas) return 0
    return Math.round((matricula.aulasConcluidas / matricula.totalAulas) * 100)
  }

  function formatDate(iso) {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-logo">
            <h1>Meus Cursos</h1>
          </div>
          <p className="dashboard-subtitle">Carregando suas matrículas...</p>
          <div className="dashboard-content">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 160, borderRadius: 12 }} />
                <div className="card-content">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-btn" />
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
            <button className="btn-primary" onClick={fetchMatriculas}>
              Tentar novamente
            </button>
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
        <div className="dashboard-logo">
          <h1>Meus Cursos</h1>
        </div>

        <p className="dashboard-subtitle">Continue seus estudos</p>

        {/* VAZIO */}
        {matriculas.length === 0 ? (

          <div className="enrolled-empty">
            <div className="enrolled-empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 10L12 15L2 10L12 5L22 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 10V14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2>Nenhum curso matriculado</h2>
            <p>Explore o catálogo e comece a aprender hoje!</p>
            <button
              className="btn-primary"
              style={{ marginTop: "20px" }}
              onClick={() => navigate("/painel-aluno")}
            >
              Ver cursos disponíveis
            </button>
          </div>

        ) : (

          /* GRID */
          <div className="dashboard-content">
            {matriculas.map((matricula) => {
              const progress = progressPercent(matricula)

              return (
                <div key={matricula.cursoId} className="card">

                  {/* PLACEHOLDER */}
                  <div
                    className="course-image-placeholder"
                    style={{ height: 140, borderRadius: 12 }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* CONTEÚDO */}
                  <div className="card-content">

                    <h3>{matricula.nomeCurso}</h3>

                    <p className="course-meta">
                      {matricula.nomeProfessor}
                    </p>

                    {/* PROGRESSO */}
                    <div className="enrolled-progress-header">
                      <span className="course-meta">Progresso</span>
                      <span className="enrolled-progress-pct">{progress}%</span>
                    </div>

                    <div className="dashboard-progress-bar">
                      <div
                        className="dashboard-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="course-meta" style={{ fontSize: "0.8rem" }}>
                      {matricula.aulasConcluidas} de {matricula.totalAulas} aulas concluídas
                    </p>

                    {/* MÉDIA */}
                    {matricula.mediaFinal != null && (
                      <p className="enrolled-media">
                        Média: <strong>{matricula.mediaFinal.toFixed(1)}</strong>
                      </p>
                    )}

                    {/* PAGAMENTO */}
                    <div className="enrolled-payment-row">
                      <span className={`payment-status payment-status--${matricula.statusPagamento?.toLowerCase()}`}>
                        {matricula.statusPagamento}
                      </span>
                      <span className="course-meta" style={{ fontSize: "0.78rem" }}>
                        {matricula.modalidadePagamento === "PARCELADO"
                          ? `${matricula.numeroParcelas}x parcelado`
                          : "À vista"}
                      </span>
                    </div>

                    {/* DATA */}
                    <p className="course-meta" style={{ fontSize: "0.78rem" }}>
                      Matriculado em {formatDate(matricula.dataMatricula)}
                    </p>

                    {/* CERTIFICADO */}
                    {matricula.certificadoDisponivel && (
                      <p className="enrolled-certificate">
                        Certificado disponível!
                      </p>
                    )}

                  </div>

                  {/* AÇÕES */}
                  <div className="enrolled-actions">
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/curso/${matricula.cursoId}`)}
                    >
                      Assistir aulas
                    </button>

                    <button
                      className="btn-outline enrolled-remove-btn"
                      onClick={() => handleRemoveClick(matricula)}
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

      {/* MODAL CONFIRMAR CANCELAMENTO */}
      <ConfirmModal
        visible={confirmModal.visible}
        title="Cancelar matrícula"
        message={`Deseja cancelar sua matrícula em "${confirmModal.nomeCurso}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />

    </div>
  )
}
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import ConfirmModal from "../components/ConfirmModal"

import { useAuth } from "../context/AuthContext"
import { listarCursos, matricular, listarMatriculas } from "../api"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([]) // MatriculaResponseDTO[]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // modal de matrícula
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    courseId: null,
    courseName: "",
  })

  // modal de pagamento
  const [paymentModal, setPaymentModal] = useState({
    visible: false,
    courseId: null,
    courseName: "",
    modalidade: "AVISTA",
    parcelas: 1,
  })

  const [enrolling, setEnrolling] = useState(false)

  /* =========================
     CARREGAR DADOS
  ========================= */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [cursosData, matriculasData] = await Promise.all([
        listarCursos(),
        listarMatriculas(user.id, token),
      ])

      setCourses(cursosData)
      setEnrollments(matriculasData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user.id, token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* =========================
     HELPERS
  ========================= */

  function isEnrolled(cursoId) {
    return enrollments.some((m) => m.cursoId === cursoId)
  }

  function getMatricula(cursoId) {
    return enrollments.find((m) => m.cursoId === cursoId)
  }

  function formatPrice(preco) {
    return preco?.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }) ?? "Grátis"
  }

  function progressPercent(matricula) {
    if (!matricula || !matricula.totalAulas) return 0
    return Math.round((matricula.aulasConcluidas / matricula.totalAulas) * 100)
  }

  /* =========================
     FLUXO DE MATRÍCULA
  ========================= */

  // 1. clique em "Matricular" → abre confirm
  function handleEnrollClick(course) {
    setConfirmModal({
      visible: true,
      courseId: course.id,
      courseName: course.nome,
    })
  }

  // 2. confirm → abre modal de pagamento
  function handleConfirmEnroll() {
    setConfirmModal((prev) => ({ ...prev, visible: false }))
    setPaymentModal({
      visible: true,
      courseId: confirmModal.courseId,
      courseName: confirmModal.courseName,
      modalidade: "AVISTA",
      parcelas: 1,
    })
  }

  // 3. confirma pagamento → chama API
  async function handleConfirmPayment() {
    const { courseId, modalidade, parcelas } = paymentModal

    const dados = {
      cursoId: courseId,
      modalidadePagamento: modalidade,
      numeroParcelas: modalidade === "PARCELADO" ? parcelas : 1,
    }

    try {
      setEnrolling(true)
      await matricular(user.id, dados, token)

      // recarrega matrículas
      const updated = await listarMatriculas(user.id, token)
      setEnrollments(updated)

      setPaymentModal((prev) => ({ ...prev, visible: false }))
    } catch (err) {
      alert("Erro ao matricular: " + err.message)
    } finally {
      setEnrolling(false)
    }
  }

  /* =========================
     LOADING / ERRO
  ========================= */

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <p className="dashboard-subtitle">Carregando cursos...</p>
          </div>
          <div className="dashboard-content">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="skeleton skeleton-image" style={{ height: 180, borderRadius: 12 }} />
                <div className="skeleton skeleton-title" style={{ height: 16, width: "70%", margin: "8px 0" }} />
                <div className="skeleton skeleton-text" style={{ height: 14, width: "90%" }} />
                <div className="skeleton skeleton-btn" style={{ height: 40, marginTop: 16 }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="courses-error">
            <p>⚠️ {error}</p>
            <button className="btn-primary" onClick={fetchData}>
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

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="dashboard-main">

        {/* HEADER */}
        <div className="dashboard-header">
          <div className="dashboard-logo">
            <svg
              width="70"
              height="70"
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
            <h1>Aprenda+</h1>
          </div>

          <p className="dashboard-subtitle">
            Olá, {user.nome?.split(" ")[0]}! Explore os cursos disponíveis.
          </p>
        </div>

        {/* GRID DE CURSOS */}
        <div className="dashboard-content">
          {courses.map((course) => {
            const enrolled = isEnrolled(course.id)
            const matricula = getMatricula(course.id)
            const progress = progressPercent(matricula)

            return (
              <div key={course.id} className="card">

                {/* PLACEHOLDER IMAGEM */}
                <div className="course-image-placeholder" style={{ height: 160, borderRadius: 12 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* CONTEÚDO */}
                <div className="card-content">
                  <h3>{course.nome}</h3>

                  <p className="course-meta">
                    👨‍🏫 {course.nomeProfessor}
                  </p>

                  <p className="course-meta">
                    📚 {course.numeroAulas} aulas · ⏱ {course.cargaHoraria}h
                  </p>

                  <p className="course-price">
                    {formatPrice(course.preco)}
                  </p>

                  {/* STATUS + PROGRESSO */}
                  {enrolled ? (
                    <>
                      <p className="enroll-status enroll-status--ok">
                        ✔ Matriculado
                      </p>

                      <div className="dashboard-progress-bar">
                        <div
                          className="dashboard-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="course-meta" style={{ fontSize: "0.8rem" }}>
                        {matricula.aulasConcluidas}/{matricula.totalAulas} aulas concluídas
                      </p>

                      {matricula.statusPagamento && (
                        <p className={`payment-status payment-status--${matricula.statusPagamento.toLowerCase()}`}>
                          💳 {matricula.statusPagamento}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="enroll-status enroll-status--none">
                      Não matriculado
                    </p>
                  )}
                </div>

                {/* AÇÕES */}
                <div className="card-actions">
                  {enrolled ? (
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      Assistir aulas
                    </button>
                  ) : (
                    <button
                      className="btn-outline"
                      onClick={() => handleEnrollClick(course)}
                    >
                      Matricular
                    </button>
                  )}
                </div>

              </div>
            )
          })}
        </div>

      </main>

      {/* MODAL CONFIRMAR MATRÍCULA */}
      <ConfirmModal
        visible={confirmModal.visible}
        title="Confirmar matrícula"
        message={`Deseja se matricular em "${confirmModal.courseName}"?`}
        onConfirm={handleConfirmEnroll}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />

      {/* MODAL DE PAGAMENTO */}
      {paymentModal.visible && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal payment-modal">
            <h3 className="confirm-title">Forma de Pagamento</h3>
            <p className="confirm-message">
              {paymentModal.courseName}
            </p>

            <div className="payment-options">
              <label className={`payment-option ${paymentModal.modalidade === "AVISTA" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="modalidade"
                  value="AVISTA"
                  checked={paymentModal.modalidade === "AVISTA"}
                  onChange={() =>
                    setPaymentModal((prev) => ({
                      ...prev,
                      modalidade: "AVISTA",
                      parcelas: 1,
                    }))
                  }
                />
                À vista
              </label>

              <label className={`payment-option ${paymentModal.modalidade === "PARCELADO" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="modalidade"
                  value="PARCELADO"
                  checked={paymentModal.modalidade === "PARCELADO"}
                  onChange={() =>
                    setPaymentModal((prev) => ({
                      ...prev,
                      modalidade: "PARCELADO",
                      parcelas: 2,
                    }))
                  }
                />
                Parcelado
              </label>
            </div>

            {paymentModal.modalidade === "PARCELADO" && (
              <div className="payment-parcelas">
                <label htmlFor="parcelas">Número de parcelas</label>
                <select
                  id="parcelas"
                  value={paymentModal.parcelas}
                  onChange={(e) =>
                    setPaymentModal((prev) => ({
                      ...prev,
                      parcelas: Number(e.target.value),
                    }))
                  }
                >
                  {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>{n}x</option>
                  ))}
                </select>
              </div>
            )}

            <div className="confirm-actions">
              <button
                className="btn-secondary"
                onClick={() =>
                  setPaymentModal((prev) => ({ ...prev, visible: false }))
                }
                disabled={enrolling}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirmPayment}
                disabled={enrolling}
              >
                {enrolling ? "Matriculando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import ConfirmModal from "../components/ConfirmModal"

import { useAuth } from "../context/AuthContext"
import {
  detalharCurso,
  listarMatriculas,
  marcarAulaAssistida,
  cursoConcluido,
  emitirCertificado,
  enviarDuvida,
  listarDuvidas,
} from "../api"

export default function Course() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [course, setCourse] = useState(null)
  const [matricula, setMatricula] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // progresso
  const [markingWatched, setMarkingWatched] = useState(false)
  const [courseDone, setCourseDone] = useState(false)

  // certificado
  const [certModal, setCertModal] = useState(false)
  const [emittingCert, setEmittingCert] = useState(false)
  const [certificate, setCertificate] = useState(null)

  // dúvidas
  const [duvidas, setDuvidas] = useState([])
  const [duvidaText, setDuvidaText] = useState("")
  const [sendingDuvida, setSendingDuvida] = useState(false)
  const [showDuvidas, setShowDuvidas] = useState(false)

  /* =========================
     CARREGAR CURSO
  ========================= */

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [courseData, matriculasData] = await Promise.all([
        detalharCurso(id),
        listarMatriculas(user.id, token),
      ])

      setCourse(courseData)

      // aula inicial: primeira não assistida ou a primeira
      const firstUnwatched =
        courseData.videoAulas?.find((a) => !a.assistida) ||
        courseData.videoAulas?.[0]
      setCurrentLesson(firstUnwatched || null)

      // matrícula deste curso
      const mat = matriculasData.find((m) => m.cursoId === Number(id))
      setMatricula(mat || null)

      // curso já concluído?
      if (mat) {
        const done = await cursoConcluido(user.id, id, token)
        setCourseDone(done)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, user.id, token])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  /* =========================
     TROCAR AULA
  ========================= */

  async function handleSelectLesson(lesson) {
    setCurrentLesson(lesson)
    setDuvidas([])
    setShowDuvidas(false)
    setDuvidaText("")

    // carrega dúvidas da aula selecionada
    try {
      const data = await listarDuvidas(lesson.id, token)
      setDuvidas(data)
    } catch {
      // silencia — dúvidas são secundárias
    }
  }

  /* =========================
     MARCAR ASSISTIDA
  ========================= */

  async function handleMarkWatched() {
    if (!currentLesson || currentLesson.assistida) return

    try {
      setMarkingWatched(true)
      await marcarAulaAssistida(user.id, currentLesson.id, token)

      // atualiza local
      setCourse((prev) => ({
        ...prev,
        videoAulas: prev.videoAulas.map((a) =>
          a.id === currentLesson.id ? { ...a, assistida: true } : a
        ),
      }))
      setCurrentLesson((prev) => ({ ...prev, assistida: true }))

      // verifica se concluiu tudo
      const done = await cursoConcluido(user.id, id, token)
      setCourseDone(done)
    } catch (err) {
      alert("Erro ao marcar aula: " + err.message)
    } finally {
      setMarkingWatched(false)
    }
  }

  /* =========================
     PROGRESSO
  ========================= */

  function progressPercent() {
    if (!course?.videoAulas?.length) return 0
    const watched = course.videoAulas.filter((a) => a.assistida).length
    return Math.round((watched / course.videoAulas.length) * 100)
  }

  /* =========================
     CERTIFICADO
  ========================= */

  async function handleEmitCertificate() {
    try {
      setEmittingCert(true)
      const cert = await emitirCertificado(user.id, id, token)
      setCertificate(cert)
      setCertModal(false)
    } catch (err) {
      alert("Erro ao emitir certificado: " + err.message)
    } finally {
      setEmittingCert(false)
    }
  }

  /* =========================
     DÚVIDAS
  ========================= */

  async function handleToggleDuvidas() {
    if (!showDuvidas && currentLesson) {
      try {
        const data = await listarDuvidas(currentLesson.id, token)
        setDuvidas(data)
      } catch {
        setDuvidas([])
      }
    }
    setShowDuvidas((v) => !v)
  }

  async function handleSendDuvida(e) {
    e.preventDefault()
    const pergunta = duvidaText.trim()
    if (!pergunta || !currentLesson) return

    try {
      setSendingDuvida(true)
      await enviarDuvida(user.id, { pergunta, videoAulaId: currentLesson.id }, token)
      setDuvidaText("")
      // recarrega dúvidas
      const data = await listarDuvidas(currentLesson.id, token)
      setDuvidas(data)
    } catch (err) {
      alert("Erro ao enviar dúvida: " + err.message)
    } finally {
      setSendingDuvida(false)
    }
  }

  /* =========================
     FORMATAR DURAÇÃO
  ========================= */

  function formatDuration(dur) {
    if (!dur) return ""
    // HH:mm:ss → remove horas se 00
    const parts = dur.split(":")
    if (parts.length === 3 && parts[0] === "00") return `${parts[1]}:${parts[2]}`
    return dur
  }

  function formatDate(iso) {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("pt-BR")
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="course-page">
        <Sidebar />
        <main className="course-content">
          <div className="skeleton" style={{ height: 170, borderRadius: 18, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 420, borderRadius: 20, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 18 }} />
        </main>
        <aside className="lessons-sidebar">
          <div className="skeleton" style={{ height: 24, width: "60%", marginBottom: 20 }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14, marginBottom: 14 }} />
          ))}
        </aside>
      </div>
    )
  }

  /* =========================
     ERRO / NÃO MATRICULADO
  ========================= */

  if (error) {
    return (
      <div className="course-page">
        <Sidebar />
        <main className="course-content">
          <div className="courses-error">
            <p>⚠️ {error}</p>
            <button className="btn-primary" onClick={fetchCourse}>Tentar novamente</button>
          </div>
        </main>
      </div>
    )
  }

  if (!course) return null

  if (!matricula) {
    return (
      <div className="course-page">
        <Sidebar />
        <main className="course-content">
          <div className="courses-error">
            <p>Você não está matriculado neste curso.</p>
            <button className="btn-primary" onClick={() => navigate("/dashboard")}>
              Ver cursos
            </button>
          </div>
        </main>
      </div>
    )
  }

  const progress = progressPercent()
  const watchedCount = course.videoAulas?.filter((a) => a.assistida).length ?? 0

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="course-page">

      {/* SIDEBAR NAV */}
      <Sidebar />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="course-content">

        {/* HEADER DO CURSO */}
        <div className="course-header">
          <div className="course-image-placeholder course-banner-placeholder">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="course-header-info">
            <h1>{course.nome}</h1>
            <p>{course.ementa}</p>

            <div className="course-header-meta">
              <span>👨‍🏫 {course.professor?.nome}</span>
              <span>📚 {course.numeroAulas} aulas</span>
              <span>⏱ {course.cargaHoraria}h</span>
              {course.notaAvaliacao > 0 && (
                <span>⭐ {course.notaAvaliacao?.toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>

        {/* PLAYER */}
        {currentLesson ? (
          <>
            <div className="video-container">
              <iframe
                key={currentLesson.id}
                src={currentLesson.url}
                title={currentLesson.titulo}
                allowFullScreen
              />
            </div>

            {/* INFO AULA */}
            <div className="lesson-info">
              <div className="lesson-info-header">
                <h2>{currentLesson.titulo}</h2>
                {currentLesson.assistida ? (
                  <span className="lesson-watched-badge">✔ Assistida</span>
                ) : (
                  <button
                    className="btn-primary lesson-watched-btn"
                    onClick={handleMarkWatched}
                    disabled={markingWatched}
                  >
                    {markingWatched ? "Marcando..." : "Marcar como assistida"}
                  </button>
                )}
              </div>

              <p>
                Duração: {formatDuration(currentLesson.duracao)} &nbsp;·&nbsp;
                Continue avançando e desenvolvendo novas habilidades na prática.
              </p>

              {/* DÚVIDAS */}
              <div className="duvidas-section">
                <button
                  className="btn-secondary duvidas-toggle"
                  onClick={handleToggleDuvidas}
                >
                  {showDuvidas ? "Ocultar dúvidas" : `Dúvidas desta aula (${duvidas.length})`}
                </button>

                {showDuvidas && (
                  <div className="duvidas-content">
                    {/* FORM */}
                    <form className="duvida-form" onSubmit={handleSendDuvida}>
                      <textarea
                        className="duvida-input"
                        placeholder="Escreva sua dúvida sobre esta aula..."
                        value={duvidaText}
                        onChange={(e) => setDuvidaText(e.target.value)}
                        rows={3}
                      />
                      <button
                        className="btn-primary"
                        type="submit"
                        disabled={sendingDuvida || !duvidaText.trim()}
                      >
                        {sendingDuvida ? "Enviando..." : "Enviar dúvida"}
                      </button>
                    </form>

                    {/* LISTA */}
                    {duvidas.length === 0 ? (
                      <p className="duvidas-empty">Nenhuma dúvida ainda. Seja o primeiro!</p>
                    ) : (
                      <div className="duvidas-list">
                        {duvidas.map((d) => (
                          <div key={d.id} className="duvida-card">
                            <div className="duvida-header">
                              <strong>{d.nomeAluno}</strong>
                              <span className="duvida-date">{formatDate(d.dataEnvio)}</span>
                            </div>
                            <p className="duvida-pergunta">{d.pergunta}</p>
                            {d.resposta ? (
                              <div className="duvida-resposta">
                                <span className="duvida-professor">
                                  👨‍🏫 {d.nomeProfessor}
                                </span>
                                <p>{d.resposta}</p>
                              </div>
                            ) : (
                              <span className="duvida-pending">Aguardando resposta...</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="courses-error">
            <p>Este curso ainda não possui aulas disponíveis.</p>
          </div>
        )}

        {/* CERTIFICADO */}
        {courseDone && !certificate && (
          <div className="certificate-banner">
            <span>🎓 Você concluiu todas as aulas!</span>
            <button
              className="btn-primary"
              onClick={() => setCertModal(true)}
            >
              Emitir certificado
            </button>
          </div>
        )}

        {certificate && (
          <div className="certificate-card">
            <h3>🎓 Certificado emitido!</h3>
            <p><strong>Aluno:</strong> {certificate.nomeAluno}</p>
            <p><strong>Curso:</strong> {certificate.nomeCurso}</p>
            <p><strong>Professor:</strong> {certificate.nomeProfessor}</p>
            <p><strong>Emitido em:</strong> {formatDate(certificate.dataEmissao)}</p>
            <p className="certificate-code">
              Código de validação: <code>{certificate.codigoValidacao}</code>
            </p>
          </div>
        )}

      </main>

      {/* SIDEBAR DE AULAS */}
      <aside className="lessons-sidebar">

        <h3>Conteúdo do Curso</h3>

        <div className="lessons-list">
          {course.videoAulas?.map((lesson) => (
            <div
              key={lesson.id}
              className={[
                "lesson-card",
                currentLesson?.id === lesson.id ? "active" : "",
                lesson.assistida ? "watched" : "",
              ].join(" ")}
              onClick={() => handleSelectLesson(lesson)}
            >
              <div className="lesson-card-header">
                <h4>{lesson.titulo}</h4>
                {lesson.assistida && (
                  <span className="lesson-check">✔</span>
                )}
              </div>
              <span>{formatDuration(lesson.duracao)}</span>
            </div>
          ))}
        </div>

        {/* PROGRESSO */}
        <div className="progress-box">
          <div className="progress-box-header">
            <h4>Seu progresso</h4>
            <span className="progress-pct">{progress}%</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="progress-label">
            {watchedCount} de {course.videoAulas?.length ?? 0} aulas assistidas
          </p>

          {matricula.mediaFinal != null && (
            <p className="progress-label">
              📊 Média: <strong>{matricula.mediaFinal.toFixed(1)}</strong>
            </p>
          )}
        </div>

      </aside>

      {/* MODAL CERTIFICADO */}
      <ConfirmModal
        visible={certModal}
        title="Emitir certificado"
        message={`Deseja emitir seu certificado para o curso "${course.nome}"?`}
        onConfirm={handleEmitCertificate}
        onCancel={() => setCertModal(false)}
      />

    </div>
  )
}
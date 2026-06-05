import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { listarCursos } from "../api"

export default function Courses() {
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* =========================
     CARREGAR CURSOS
  ========================= */

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      setLoading(true)
      setError(null)
      const data = await listarCursos()
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  /* =========================
     ESTADOS DE CARREGAMENTO
  ========================= */

  if (loading) {
    return (
      <section className="courses">
        <div className="container">
          <h2 className="section-title">Cursos em Destaque</h2>
          <div className="courses-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="course-card course-skeleton">
                <div className="skeleton skeleton-image" />
                <div className="course-content">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="courses">
        <div className="container">
          <h2 className="section-title">Cursos em Destaque</h2>
          <div className="courses-error">
            <p>⚠️ {error}</p>
            <button className="btn-primary" onClick={fetchCourses}>
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    )
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <section className="courses" id="courses">
      <div className="container">

        <h2 className="section-title">Cursos em Destaque</h2>

        {courses.length === 0 ? (
          <div className="courses-empty">
            <p>Nenhum curso disponível no momento.</p>
          </div>
        ) : (

          /* GRID */
          <div className="courses-grid">
            {courses.map((course) => (
              <article className="course-card" key={course.id}>
                {course.urlBanner ? (
                  <img className="course-image" src={course.urlBanner} alt={course.nome} />
                ) : (
                  <div className="course-image-placeholder">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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
                    </svg>
                  </div>
                )}

                <div className="course-content">
                  <h3 className="course-title">{course.nome}</h3>
                  <p className="course-description">{course.descricao || "Descrição em breve."}</p>
                  <button
                    type="button"
                    className="btn-outline course-card-btn"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Ver Curso
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
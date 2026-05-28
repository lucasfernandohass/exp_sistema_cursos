import { useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import courses from "../data/courses"

export default function Dashboard() {

  const navigate = useNavigate()

  /* =========================
     PEGAR MATRÍCULAS
  ========================= */

  function getEnrollments() {

    return JSON.parse(
      localStorage.getItem("enrollments")
    ) || []
  }

  /* =========================
     SALVAR MATRÍCULAS
  ========================= */

  function saveEnrollments(data) {

    localStorage.setItem(
      "enrollments",
      JSON.stringify(data)
    )
  }

  /* =========================
     MATRICULAR
  ========================= */

  function enroll(courseId) {

    const current = getEnrollments()

    if (!current.includes(courseId)) {

      const updated = [
        ...current,
        courseId
      ]

      saveEnrollments(updated)
    }

    navigate("/matriculados")
  }

  const enrolled = getEnrollments()

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

            <h1>
              Aprenda+
            </h1>

          </div>

          <p className="dashboard-subtitle">
            Cursos em destaque
          </p>

        </div>

        {/* GRID */}
        <div className="dashboard-content">

          {courses.map((course) => {

            const isEnrolled =
              enrolled.includes(course.id)

            return (

              <div
                key={course.id}
                className="card"
              >

                {/* IMAGEM */}
                <img
                  src={course.image}
                  alt={course.title}
                  className="course-image"
                />

                {/* CONTEÚDO */}
                <div className="card-content">

                  <h3>
                    {course.title}
                  </h3>

                  <p
                    style={{
                      color: "var(--muted-foreground)",
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      marginTop: "10px"
                    }}
                  >
                    {course.description}
                  </p>

                  {/* STATUS */}
                  <div
                    style={{
                      marginTop: "18px",
                      marginBottom: "18px"
                    }}
                  >

                    {isEnrolled ? (

                      <span
                        style={{
                          color: "#22c55e",
                          fontWeight: "600"
                        }}
                      >
                        Matriculado ✔
                      </span>

                    ) : (

                      <span
                        style={{
                          color: "var(--muted-foreground)"
                        }}
                      >
                        Não matriculado
                      </span>

                    )}

                  </div>

                  {/* BOTÃO */}
                  {isEnrolled ? (

                    <button
                      className="btn-primary"
                      onClick={() =>
                        navigate(`/course/${course.id}`)
                      }
                    >
                      Assistir aula
                    </button>

                  ) : (

                    <button
                      className="btn-outline"
                      onClick={() =>
                        enroll(course.id)
                      }
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

    </div>
  )
}
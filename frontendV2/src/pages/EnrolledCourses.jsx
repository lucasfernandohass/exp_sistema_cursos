import { useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import courses from "../data/courses"

export default function EnrolledCourses() {

  const navigate = useNavigate()

  // pega matrículas salvas
  const enrollments =
    JSON.parse(localStorage.getItem("enrollments")) || []

  // filtra cursos matriculados
  const enrolledCourses = courses.filter(course =>
    enrollments.includes(course.id)
  )

  // limpar matrículas
  function clearEnrollments() {

    localStorage.removeItem("enrollments")

    window.location.reload()
  }

  // remover curso específico
  function removeCourse(courseId) {

    const updated =
      enrollments.filter(id => id !== courseId)

    localStorage.setItem(
      "enrollments",
      JSON.stringify(updated)
    )

    window.location.reload()
  }

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        {/* HEADER */}
        <div className="dashboard-logo">

          <h1>Meus Cursos</h1>

        </div>

        <p className="dashboard-subtitle">
          Continue seus estudos
        </p>

        {/* BOTÃO LIMPAR */}
        {enrolledCourses.length > 0 && (

          <button
            className="btn-primary"
            style={{
              marginBottom: "30px"
            }}
            onClick={clearEnrollments}
          >
            Limpar Matrículas
          </button>

        )}

        {/* CURSOS */}
        <div className="dashboard-content">

          {enrolledCourses.length > 0 ? (

            enrolledCourses.map(course => (

              <div
                key={course.id}
                className="card"
              >

                <img
                  src={course.image}
                  alt={course.title}
                  className="course-image"
                />

                <h3>
                  {course.title}
                </h3>

                <p
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "0.95rem",
                    marginBottom: "20px"
                  }}
                >
                  {course.description}
                </p>

                {/* BOTÕES */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px"
                  }}
                >

                  <button
                    className="btn-primary"
                    onClick={() =>
                      navigate(`/course/${course.id}`)
                    }
                  >
                    Assistir Aula
                  </button>

                  <button
                    className="btn-outline"
                    onClick={() =>
                      removeCourse(course.id)
                    }
                  >
                    Remover
                  </button>

                </div>

              </div>

            ))

          ) : (

            <div>

              <h2>
                Nenhum curso matriculado
              </h2>

              <p
                style={{
                  color: "var(--muted-foreground)",
                  marginTop: "10px"
                }}
              >
                Vá para a Home e matricule-se
                em um curso.
              </p>

            </div>

          )}

        </div>

      </main>

    </div>
  )
}
import { useNavigate } from "react-router-dom"
import courses from "../data/courses"

export default function Dashboard() {

  const navigate = useNavigate()

  function getEnrollments() {
    return JSON.parse(localStorage.getItem("enrollments")) || []
  }

  function saveEnrollments(data) {
    localStorage.setItem("enrollments", JSON.stringify(data))
  }

  function enroll(courseId) {
    const current = getEnrollments()

    if (!current.includes(courseId)) {
      saveEnrollments([...current, courseId])
    }

    navigate(`/curso/${courseId}`)
  }

  const enrolled = getEnrollments()

  return (
    <div className="dashboard">

      {/* LOGO CENTRAL */}
      <div className="dashboard-logo">
        <svg
  width="64"
  height="64"
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
      </div>

      {/* SUBTÍTULO */}
      <p className="dashboard-subtitle">
        Cursos em destaque
      </p>

      {/* GRID */}
      <div className="dashboard-content">

        {courses.map(course => (

          <div key={course.id} className="card">

            <img
              src={course.image}
              alt={course.title}
              className="course-image"
            />

            <h3>{course.title}</h3>

            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
              {course.description}
            </p>

            {enrolled.includes(course.id) ? (
              <button
                className="btn-primary"
                onClick={() => navigate(`/curso/${course.id}`)}
              >
                Assistir aula
              </button>
            ) : (
              <button
                className="btn-outline"
                onClick={() => enroll(course.id)}
              >
                Matricular
              </button>
            )}

          </div>

        ))}

      </div>

    </div>
  )
}
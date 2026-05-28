import courses from "../data/courses"

export default function Courses() {
  return (
    <section className="courses">

      <div className="container">

        <h2 className="section-title">
          Cursos em Destaque
        </h2>

        <div className="courses-grid">

          {courses.map((course) => (

            <div
              className="course-card"
              key={course.id}
            >

              <img
                src={course.image}
                alt={course.title}
                className="course-image"
              />

              <div className="course-content">

                <h3 className="course-title">
                  {course.title}
                </h3>

                <p className="course-description">
                  {course.description}
                </p>

                <button className="btn-outline">
                  Ver Curso
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  )
}
import { useState } from "react"
import { useParams } from "react-router-dom"

import Sidebar from "../components/Sidebar"

import courses from "../data/courses"
import lessons from "../data/lessons"

export default function Course() {

  const { id } = useParams()

  /* =========================
     BUSCAR CURSO
  ========================= */

  const course = courses.find(
    (c) => c.id === id
  )

  /* =========================
     AULA ATUAL
  ========================= */

  const [currentLesson, setCurrentLesson] =
    useState(lessons[0])

  /* =========================
     CURSO NÃO ENCONTRADO
  ========================= */

  if (!course) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "20px"
        }}
      >

        <h1>
          Curso não encontrado
        </h1>

      </div>

    )
  }

  return (
    <div className="course-page">

      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTEÚDO */}
      <main className="course-content">

        {/* HEADER */}
        <div className="course-header">

          {/* IMAGEM */}
          <img
            src={course.image}
            alt={course.title}
            className="course-banner"
          />

          {/* INFO */}
          <div className="course-header-info">

            <h1>
              {course.title}
            </h1>

            <p>
              {course.description}
            </p>

          </div>

        </div>

        {/* PLAYER */}
        <div className="video-container">

          <iframe
            src={currentLesson.video}
            title={currentLesson.title}
            allowFullScreen
          />

        </div>

        {/* INFO AULA */}
        <div className="lesson-info">

          <h2>
            {currentLesson.title}
          </h2>

          <p>
            Continue avançando no curso e
            desenvolvendo novas habilidades
            na prática.
          </p>

        </div>

      </main>

      {/* SIDEBAR AULAS */}
      <aside className="lessons-sidebar">

        <h3>
          Conteúdo do Curso
        </h3>

        <div className="lessons-list">

          {lessons.map((lesson) => (

            <div
              key={lesson.id}
              className={
                currentLesson.id === lesson.id
                  ? "lesson-card active"
                  : "lesson-card"
              }

              onClick={() =>
                setCurrentLesson(lesson)
              }
            >

              <h4>
                {lesson.title}
              </h4>

              <span>
                {lesson.duration}
              </span>

            </div>

          ))}

        </div>

        {/* PROGRESSO */}
        <div className="progress-box">

          <h4>
            Seu progresso
          </h4>

          <div className="progress-bar">

            <div className="progress-fill" />

          </div>

        </div>

      </aside>

    </div>
  )
}
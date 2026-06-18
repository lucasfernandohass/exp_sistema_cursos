import Navbar from "../components/Navbar"
import Courses from "../components/Courses"
import Footer from "../components/Footer"
import ThemeToggle from "../components/ThemeToggle"

import "../styles/courses.css";
import "../styles/curso-detalhe.css";

export default function Cursos() {
  return (
    <>
      <Navbar />

      <div className="cursos-page-hero">
        <div className="container cursos-page-hero-inner">
          <h1 className="cursos-page-title"><br></br>Explore nossos cursos</h1>
          <p className="cursos-page-sub">
            Aprenda no seu ritmo com os melhores cursos online. Milhares de opções para você se desenvolver profissionalmente e alcançar seus objetivos.
          </p>
        </div>
      </div>

      <Courses
        comBusca
        titulo="Todos os Cursos"
      />

      <Footer />
      <ThemeToggle />
    </>
  )
}
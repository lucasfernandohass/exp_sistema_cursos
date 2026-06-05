import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { listarCursos, pesquisarCursos } from "../api"

export default function Courses() {
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [searching, setSearching] = useState(false)

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
     PESQUISAR
  ========================= */

  async function handleSearch(e) {
    e.preventDefault()
    const termo = search.trim()

    if (!termo) {
      fetchCourses()
      return
    }

    try {
      setSearching(true)
      setError(null)
      const data = await pesquisarCursos(termo)
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  function handleSearchChange(e) {
    const value = e.target.value
    setSearch(value)
    // limpa pesquisa ao apagar tudo
    if (!value.trim()) fetchCourses()
  }

  /* =========================
     FORMATAR PREÇO
  ========================= */

  function formatPrice(preco) {
    return preco?.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }) ?? "Grátis"
  }

  /* =========================
     RENDER ESTRELAS
  ========================= */

  function renderStars(nota) {
    if (!nota) return null
    const full = Math.floor(nota)
    const half = nota % 1 >= 0.5
    return (
      <span className="course-stars" title={`${nota} de 5`}>
        {"★".repeat(full)}
        {half ? "½" : ""}
        {"☆".repeat(5 - full - (half ? 1 : 0))}
        <span className="course-nota"> {nota.toFixed(1)}</span>
      </span>
    )
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

        {/* PESQUISA */}
        <form className="courses-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Pesquisar cursos..."
            value={search}
            onChange={handleSearchChange}
            className="courses-search-input"
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={searching}
          >
            {searching ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {/* RESULTADO VAZIO */}
        {courses.length === 0 ? (
          <div className="courses-empty">
            <p>Nenhum curso encontrado{search ? ` para "${search}"` : ""}.</p>
            {search && (
              <button
                className="btn-outline"
                style={{ marginTop: "12px" }}
                onClick={() => { setSearch(""); fetchCourses() }}
              >
                Ver todos os cursos
              </button>
            )}
          </div>
        ) : (

          /* GRID */
          <div className="courses-grid">
            {courses.map((course) => (
              <div className="course-card" key={course.id}>

                {/* IMAGEM PLACEHOLDER (API não retorna image) */}
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

                <div className="course-content">

                  <h3 className="course-title">{course.nome}</h3>

                  <p className="course-meta">
                    👨‍🏫 {course.nomeProfessor}
                  </p>

                  <p className="course-meta">
                    📚 {course.numeroAulas} aulas &nbsp;·&nbsp;
                    ⏱ {course.cargaHoraria}h
                  </p>

                  {course.notaAvaliacao > 0 && (
                    <p className="course-rating">
                      {renderStars(course.notaAvaliacao)}
                    </p>
                  )}

                  <p className="course-price">
                    {formatPrice(course.preco)}
                  </p>

                  <button
                    className="btn-outline"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Ver Curso
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
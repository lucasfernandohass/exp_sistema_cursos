import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { listarCursos, pesquisarCursos } from "../api"

/**
 * Componente reutilizável de grid de cursos.
 *
 * Props:
 *  - comBusca  {boolean} — exibe barra de pesquisa (padrão: false)
 *  - titulo    {string}  — título da seção (padrão: "Cursos em Destaque")
 *  - limite    {number}  — limita quantos cursos exibir (padrão: sem limite)
 */
export default function Courses({ comBusca = false, titulo = "Cursos em Destaque", limite }) {
  const navigate = useNavigate()

  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busca, setBusca] = useState("")
  const [buscando, setBuscando] = useState(false)
  const debounceRef = useRef(null)

  /* =========================
     CARREGAR CURSOS
  ========================= */

  const carregarCursos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listarCursos()
      setCursos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarCursos()
  }, [carregarCursos])

  /* =========================
     PESQUISA COM DEBOUNCE
  ========================= */

  function handleBuscaChange(e) {
    const valor = e.target.value
    setBusca(valor)
    clearTimeout(debounceRef.current)

    if (!valor.trim()) {
      carregarCursos()
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setBuscando(true)
        setError(null)
        const data = await pesquisarCursos(valor.trim())
        setCursos(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setBuscando(false)
      }
    }, 400)
  }

  function limparBusca() {
    setBusca("")
    carregarCursos()
  }

  /* =========================
     HELPERS
  ========================= */

  function formatarPreco(preco) {
    if (!preco && preco !== 0) return "—"
    if (preco === 0) return "Grátis"
    return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  function renderEstrelas(nota) {
    if (!nota || nota === 0) return null
    const inteiras = Math.floor(nota)
    const meia = nota % 1 >= 0.5
    return (
      <span className="course-stars" title={`${nota} de 5`}>
        {"★".repeat(inteiras)}
        {meia ? "½" : ""}
        {"☆".repeat(5 - inteiras - (meia ? 1 : 0))}
        <span className="course-nota"> {nota.toFixed(1)}</span>
      </span>
    )
  }

  // aplica limite se definido
  const listagem = limite ? cursos.slice(0, limite) : cursos

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <section className="courses" id="courses">
        <div className="container">
          <h2 className="section-title">{titulo}</h2>
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

  /* =========================
     ERRO
  ========================= */

  if (error) {
    return (
      <section className="courses" id="courses">
        <div className="container">
          <h2 className="section-title">{titulo}</h2>
          <div className="courses-error">
            <p>⚠️ {error}</p>
            <button className="btn-primary" onClick={carregarCursos}>
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

        <h2 className="section-title">{titulo}</h2>

        {/* BARRA DE PESQUISA — só quando comBusca=true */}
        {comBusca && (
          <div className="cursos-search-wrap" style={{ maxWidth: "100%", marginBottom: "2rem" }}>
            <div className="cursos-search-box">
              <svg className="cursos-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>

              <input
                className="cursos-search-input"
                type="text"
                placeholder="Buscar cursos..."
                value={busca}
                onChange={handleBuscaChange}
              />

              {busca && (
                <button className="cursos-search-clear" onClick={limparBusca} aria-label="Limpar busca">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}

              {buscando && <div className="cursos-search-spinner" />}
            </div>

            {comBusca && !loading && (
              <p className="cursos-contagem">
                {busca
                  ? `${cursos.length} resultado${cursos.length !== 1 ? "s" : ""} para "${busca}"`
                  : `${cursos.length} curso${cursos.length !== 1 ? "s" : ""} disponíve${cursos.length !== 1 ? "is" : "l"}`}
              </p>
            )}
          </div>
        )}

        {/* VAZIO */}
        {listagem.length === 0 ? (
          <div className="courses-empty">
            <p>
              {busca
                ? `Nenhum curso encontrado para "${busca}".`
                : "Nenhum curso disponível no momento."}
            </p>
            {busca && (
              <button className="btn-outline" style={{ marginTop: 12 }} onClick={limparBusca}>
                Ver todos os cursos
              </button>
            )}
          </div>
        ) : (

          /* GRID */
          <div className="courses-grid">
            {listagem.map((curso) => (
              <article className="course-card" key={curso.id}>

                {/* BANNER */}
                {curso.urlBanner ? (
                  <img
                    className="course-image"
                    src={curso.urlBanner}
                    alt={curso.nome}
                  />
                ) : (
                  <div className="course-image-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                <div className="course-content">
                  <h3 className="course-title">{curso.nome}</h3>

                  {curso.descricao && (
                    <p className="course-description">{curso.descricao}</p>
                  )}

                  {/* META — só exibe quando comBusca (página completa) */}
                  {comBusca && (
                    <div className="course-meta-row">
                      {curso.nomeProfessor && (
                        <span className="course-meta">{curso.nomeProfessor}</span>
                      )}
                      {curso.numeroAulas > 0 && (
                        <span className="course-meta">{curso.numeroAulas} aulas</span>
                      )}
                      {curso.cargaHoraria > 0 && (
                        <span className="course-meta">{curso.cargaHoraria}h</span>
                      )}
                    </div>
                  )}

                  {curso.notaAvaliacao > 0 && (
                    <div className="course-rating">
                      {renderEstrelas(curso.notaAvaliacao)}
                    </div>
                  )}

                  <div className="course-card-footer">
                    <span className="course-price">
                      {formatarPreco(curso.preco)}
                    </span>
                    <button
                      type="button"
                      className="btn-outline course-card-btn"
                      onClick={() => navigate(`/curso/${curso.id}`)}
                    >
                      Ver Curso
                    </button>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
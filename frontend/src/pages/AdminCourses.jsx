import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"
import apiFetch from "../api"

/* =========================
   VALORES INICIAIS DO FORM
========================= */

const EMPTY_FORM = {
  nome: "",
  descricao: "",
  ementa: "",
  cargaHoraria: "",
  numeroAulas: "",
  preco: "",
  media: "",
  urlBanner: "",
  professorId: "",
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */

export default function AdminCourses() {
  const { user, token, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [professors, setProfessors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // modal de form (criar / editar)
  const [formModal, setFormModal] = useState({ open: false, mode: "create", course: null })
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: "", message: "" })

  // modal de confirmação de exclusão
  const [deleteModal, setDeleteModal] = useState({ open: false, course: null })
  const [deleting, setDeleting] = useState(false)

  // pesquisa
  const [search, setSearch] = useState("")

  /* =========================
     PROTEÇÃO DE ROTA
  ========================= */

  useEffect(() => {
    if (!isAdmin) navigate("/painel-aluno", { replace: true })
  }, [isAdmin, navigate])

  /* =========================
     CARREGAR CURSOS
  ========================= */

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch("/cursos")
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    if (!feedback.message) return

    const timer = setTimeout(() => setFeedback({ type: "", message: "" }), 3000)
    return () => clearTimeout(timer)
  }, [feedback.message])

  useEffect(() => {
    async function loadProfessors() {
      try {
        const data = await apiFetch("/professores")
        setProfessors(data)
      } catch (err) {
        console.error("Erro ao carregar professores:", err)
      }
    }

    loadProfessors()
  }, [])

  /* =========================
     PESQUISA LOCAL
  ========================= */

  const filtered = courses.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  )

  /* =========================
     FORM HANDLERS
  ========================= */

  function openCreate() {
    setFormData({ ...EMPTY_FORM })
    setFormErrors({})
    setFormModal({ open: true, mode: "create", course: null })
  }

  function openEdit(course) {
    setFormData({
      nome: course.nome ?? "",
      descricao: course.descricao ?? "",
      ementa: course.ementa ?? "",
      cargaHoraria: course.cargaHoraria ?? "",
      numeroAulas: course.numeroAulas ?? "",
      preco: course.preco ?? "",
      media: course.media ?? course.notaAvaliacao ?? "",
      urlBanner: course.urlBanner ?? "",
      professorId: course.professor?.id ?? professors[0]?.id ?? "",
    })
    setFormErrors({})
    setFormModal({ open: true, mode: "edit", course })
  }

  function closeForm() {
    setFormModal({ open: false, mode: "create", course: null })
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  function validate() {
    const errs = {}

    if (!formData.nome.trim()) errs.nome = "Nome obrigatório."
    if (!formData.descricao.trim()) errs.descricao = "Descrição obrigatória."
    if (!formData.ementa.trim()) errs.ementa = "Ementa obrigatória."
    if (!formData.cargaHoraria || isNaN(Number(formData.cargaHoraria)) || Number(formData.cargaHoraria) <= 0)
      errs.cargaHoraria = "Carga horária inválida."
    if (!formData.numeroAulas || isNaN(Number(formData.numeroAulas)) || Number(formData.numeroAulas) <= 0)
      errs.numeroAulas = "Número de aulas inválido."
    if (formData.preco === "" || isNaN(Number(formData.preco)) || Number(formData.preco) < 0)
      errs.preco = "Preço inválido."
    if (formData.media === "" || isNaN(Number(formData.media)) || Number(formData.media) < 0 || Number(formData.media) > 10)
      errs.media = "Média inválida. Informe um valor entre 0 e 10."
    if (!formData.urlBanner.trim()) {
      errs.urlBanner = "URL do banner obrigatória."
    } else if (!/^https?:\/\//i.test(formData.urlBanner.trim())) {
      errs.urlBanner = "Informe uma URL válida (http:// ou https://)."
    }

    return errs
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    const payload = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim(),
      ementa: formData.ementa.trim(),
      cargaHoraria: Number(formData.cargaHoraria),
      numeroAulas: Number(formData.numeroAulas),
      preco: Number(formData.preco),
      media: Number(formData.media),
      urlBanner: formData.urlBanner.trim(),
      professorId: formData.professorId ? Number(formData.professorId) : null,
    }

    try {
      setSaving(true)
      if (formModal.mode === "create") {
        const created = await apiFetch("/cursos", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        })
        setCourses((prev) => [...prev, created])
        setFeedback({ type: "success", message: "Curso criado com sucesso!" })
      } else {
        const updated = await apiFetch(`/cursos/${formModal.course.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify(payload),
        })
        setCourses((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
        )
        setFeedback({ type: "success", message: "Curso editado com sucesso!" })
      }
      closeForm()
    } catch (err) {
      setFormErrors({ _global: err.message })
    } finally {
      setSaving(false)
    }
  }

  /* =========================
     EXCLUSÃO
  ========================= */

  function openDelete(course) {
    setDeleteModal({ open: true, course })
  }

  function closeDelete() {
    setDeleteModal({ open: false, course: null })
  }

  async function handleDelete() {
    const { course } = deleteModal
    try {
      setDeleting(true)
      await apiFetch(`/cursos/${course.id}`, { method: "DELETE", token })
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
      closeDelete()
    } catch (err) {
      alert("Erro ao excluir: " + err.message)
    } finally {
      setDeleting(false)
    }
  }

  /* =========================
     HELPERS
  ========================= */

  function formatPrice(preco) {
    return preco?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—"
  }

  /* =========================
     LOADING / ERRO
  ========================= */

  if (!isAdmin) return null

  if (loading) {
    return (
      <div className="admin-page">
        <AdminHeader user={user} />
        <main className="admin-main">
          <div className="admin-toolbar">
            <div className="skeleton" style={{ height: 36, width: 200, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 36, width: 120, borderRadius: 8 }} />
          </div>
          <div className="admin-table-wrap">
            {[1,2,3,4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 10 }} />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <AdminHeader user={user} />
        <main className="admin-main">
          <div className="courses-error">
            <p>⚠️ {error}</p>
            <button className="btn-primary" onClick={fetchCourses}>Tentar novamente</button>
          </div>
        </main>
      </div>
    )
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="admin-page">
      <AdminHeader user={user} />

      <main className="admin-main">

        {feedback.message && (
          <div className={`admin-feedback admin-feedback--${feedback.type}`} role="status" aria-live="polite">
            {feedback.message}
          </div>
        )}

        {/* TOOLBAR */}
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <h1 className="admin-title">Gerenciar Cursos</h1>
            <span className="admin-count">{courses.length} curso{courses.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="admin-toolbar-right">
            <input
              className="admin-search"
              type="text"
              placeholder="Pesquisar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn-primary" onClick={openCreate}>
              <b>Novo Curso</b>
            </button>
          </div>
        </div>

        {/* TABELA */}
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <p>{search ? `Nenhum curso encontrado para "${search}".` : "Nenhum curso cadastrado ainda."}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Professor</th>
                  <th>Aulas</th>
                  <th>Carga</th>
                  <th>Preço</th>
                  <th>Média</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((course) => (
                  <tr key={course.id}>
                    <td className="admin-td-name">{course.nome}</td>
                    <td>{course.nomeProfessor ?? <span className="admin-empty-cell">—</span>}</td>
                    <td>{course.numeroAulas ?? 0}</td>
                    <td>{course.cargaHoraria}h</td>
                    <td>{formatPrice(course.preco)}</td>
                    <td>
                      {(() => {
                        const media = course.media ?? course.notaAvaliacao
                        return media && Number(media) > 0
                          ? <span className="admin-rating">{Number(media).toFixed(1)}</span>
                          : <span className="admin-empty-cell">—</span>
                      })()}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-edit"
                          onClick={() => openEdit(course)}
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          className="admin-btn-delete"
                          onClick={() => openDelete(course)}
                          title="Excluir"
                        >
                          Excluir
                        </button>
                        <button
                          className="admin-btn-manage"
                          onClick={() => navigate(`/admin/cursos/${course.id}/aulas`)}
                          title="Gerenciar aulas"
                        >
                          Aulas/Atividades
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* =========================
          MODAL CRIAR / EDITAR
      ========================= */}
      {formModal.open && (
        <div className="modal-overlay">
          <div className="modal-box">

            <div className="modal-header">
              <h2>{formModal.mode === "create" ? "Novo Curso" : "Editar Curso"}</h2>
              <button className="modal-close" onClick={closeForm} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSave}>

              {formErrors._global && (
                <div className="auth-error">{formErrors._global}</div>
              )}

              <div className="modal-field">
                <label>Nome do curso</label>
                <input
                  name="nome"
                  type="text"
                  placeholder=""
                  value={formData.nome}
                  onChange={handleChange}
                  className={formErrors.nome ? "input-error" : ""}
                />
                {formErrors.nome && <span className="field-error">{formErrors.nome}</span>}
              </div>

              <div className="modal-field">
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  placeholder="Descreva o curso..."
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={2}
                  className={formErrors.descricao ? "input-error" : ""}
                />
                {formErrors.descricao && <span className="field-error">{formErrors.descricao}</span>}
              </div>

              <div className="modal-field">
                <label>Ementa</label>
                <textarea
                  name="ementa"
                  placeholder="Descreva o conteúdo e objetivos do curso..."
                  value={formData.ementa}
                  onChange={handleChange}
                  rows={3}
                  className={formErrors.ementa ? "input-error" : ""}
                />
                {formErrors.ementa && <span className="field-error">{formErrors.ementa}</span>}
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label>Carga horária (h)</label>
                  <input
                    name="cargaHoraria"
                    type="number"
                    min="1"
                    placeholder="Ex: 40"
                    value={formData.cargaHoraria}
                    onChange={handleChange}
                    className={formErrors.cargaHoraria ? "input-error" : ""}
                  />
                  {formErrors.cargaHoraria && <span className="field-error">{formErrors.cargaHoraria}</span>}
                </div>

                <div className="modal-field">
                  <label>Num. Aulas</label>
                  <input
                    name="numeroAulas"
                    type="number"
                    min="1"
                    placeholder="Ex: 20"
                    value={formData.numeroAulas}
                    onChange={handleChange}
                    className={formErrors.numeroAulas ? "input-error" : ""}
                  />
                  {formErrors.numeroAulas && <span className="field-error">{formErrors.numeroAulas}</span>}
                </div>

                <div className="modal-field">
                  <label>Preço (R$)</label>
                  <input
                    name="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 199.90"
                    value={formData.preco}
                    onChange={handleChange}
                    className={formErrors.preco ? "input-error" : ""}
                  />
                  {formErrors.preco && <span className="field-error">{formErrors.preco}</span>}
                </div>

                <div className="modal-field">
                  <label>Média do Curso</label>
                  <input
                    name="media"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Ex: 8.5"
                    value={formData.media}
                    onChange={handleChange}
                    className={formErrors.media ? "input-error" : ""}
                  />
                  {formErrors.media && <span className="field-error">{formErrors.media}</span>}
                </div>
              </div>

              {formModal.mode === "edit" && (
                <div className="modal-field">
                  <label>Professor responsável</label>
                  <select
                    name="professorId"
                    value={formData.professorId ?? ""}
                    onChange={handleChange}
                  >
                    <option value="">Sem professor</option>
                    {professors.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-field">
                <label>URL do Banner do Curso</label>
                <input
                  name="urlBanner"
                  type="text"
                  placeholder="Ex: https://example.com/banner.jpg"
                  value={formData.urlBanner}
                  onChange={handleChange}
                  className={formErrors.urlBanner ? "input-error" : ""}
                />
                {formErrors.urlBanner && <span className="field-error">{formErrors.urlBanner}</span>}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? (formModal.mode === "create" ? "Criando..." : "Salvando...")
                    : (formModal.mode === "create" ? "Criar Curso" : "Salvar Alterações")}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================
          MODAL CONFIRMAR EXCLUSÃO
      ========================= */}
      {deleteModal.open && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--sm">
            <div className="modal-header">
              <h2>Excluir Curso</h2>
              <button className="modal-close" onClick={closeDelete} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <p className="modal-delete-msg">
              Tem certeza que deseja excluir o curso
              <strong> "{deleteModal.course?.nome}"</strong>?
              <br />
              <span className="modal-delete-warn">Esta ação não pode ser desfeita.</span>
            </p>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={closeDelete}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

/* =========================
   HEADER ADMIN
========================= */

function AdminHeader({ user }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <div className="admin-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Aprenda+</span>
          <span className="admin-badge">Admin</span>
        </div>
      </div>

      <div className="admin-header-right">
        {/* PILL USUÁRIO */}
        <div className="user-menu">
          <button
            className="user-pill-btn"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="user-pill-name">{user?.nome?.split(" ")[0]}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className={`user-pill-chevron${menuOpen ? " open" : ""}`}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="user-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="user-dropdown">
                <div className="user-dropdown-name">{user?.nome}</div>
                <div className="user-dropdown-email">{user?.email}</div>
                <hr className="user-divider" />
                <button
                  className="user-dropdown-item user-dropdown-logout"
                  onClick={() => { setMenuOpen(false); setShowConfirm(true) }}
                >
                  Sair da conta
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL LOGOUT */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box modal-box--sm">
            <div className="modal-header">
              <h2>Confirmar logout</h2>
            </div>
            <p className="modal-delete-msg">Deseja realmente sair da sua conta?</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => { setShowConfirm(false); signOut() }}>Sair</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
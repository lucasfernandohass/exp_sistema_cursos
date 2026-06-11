// src/pages/AdminAulas.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  detalharCurso,
  listarAulasPorCurso,
  criarAula,
  atualizarAula,
  excluirAula,
} from "../api";
import Toast from "../components/Toast";

export default function AdminAulas() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();

  const [curso, setCurso] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de formulário
  const [formModal, setFormModal] = useState({ open: false, mode: "create", aula: null });
  const [formData, setFormData] = useState({
    titulo: "",
    duracao: "",
    url: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Modal de exclusão
  const [deleteModal, setDeleteModal] = useState({ open: false, aula: null });
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  /* =========================
     CARREGAR DADOS
  ========================= */
  const fetchCurso = useCallback(async () => {
    try {
      const data = await detalharCurso(cursoId);
      setCurso(data);
    } catch (err) {
      setError("Erro ao carregar curso: " + err.message);
    }
  }, [cursoId]);

  const fetchAulas = useCallback(async () => {
    try {
      const data = await listarAulasPorCurso(cursoId, token);
      setAulas(data || []);
    } catch (err) {
      setError("Erro ao carregar aulas: " + err.message);
    }
  }, [cursoId, token]);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/painel-aluno");
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      await fetchCurso();
      await fetchAulas();
      setLoading(false);
    };
    loadData();
  }, [isAdmin, navigate, fetchCurso, fetchAulas]);

  /* =========================
     FORM HANDLERS
  ========================= */
  function openCreate() {
    setFormData({ titulo: "", duracao: "", url: "" });
    setFormErrors({});
    setFormModal({ open: true, mode: "create", aula: null });
  }

  function openEdit(aula) {
    setFormData({
      titulo: aula.titulo || "",
      duracao: aula.duracao || "",
      url: aula.url || "",
    });
    setFormErrors({});
    setFormModal({ open: true, mode: "edit", aula });
  }

  function closeForm() {
    setFormModal({ open: false, mode: "create", aula: null });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }

  function validate() {
    const errors = {};
    
    if (!formData.titulo.trim()) {
      errors.titulo = "Título é obrigatório";
    }
    
    if (!formData.url || !formData.url.trim()) {
      errors.url = "URL do vídeo é obrigatória";
    } else if (!/^https?:\/\//i.test(formData.url.trim())) {
      errors.url = "Informe uma URL válida (http:// ou https://)";
    }
    
    if (formData.duracao && formData.duracao.trim()) {
      const duracaoRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!duracaoRegex.test(formData.duracao)) {
        errors.duracao = "Duração inválida. Use HH:MM:SS (ex: 00:15:30)";
      }
    }
    
    return errors;
  }

  async function handleSave(e) {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      titulo: formData.titulo.trim(),
      url: formData.url.trim(),
      duracao: formData.duracao.trim() || null,
      cursoId: parseInt(cursoId),
    };

    try {
      setSaving(true);
      
      if (formModal.mode === "create") {
        const created = await criarAula(payload, token);
        setAulas(prev => [...prev, created]);
        setToast({ visible: true, message: "Aula criada com sucesso!", type: "success" });
      } else {
        const updated = await atualizarAula(formModal.aula.id, payload, token);
        setAulas(prev => prev.map(a => a.id === updated.id ? updated : a));
        setToast({ visible: true, message: "Aula atualizada com sucesso!", type: "success" });
      }
      
      closeForm();
    } catch (err) {
      setFormErrors({ _global: err.message });
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     DELETE HANDLERS
  ========================= */
  function openDelete(aula) {
    setDeleteModal({ open: true, aula });
  }

  function closeDelete() {
    setDeleteModal({ open: false, aula: null });
  }

  async function handleDelete() {
    const { aula } = deleteModal;
    try {
      setDeleting(true);
      await excluirAula(aula.id, token);
      setAulas(prev => prev.filter(a => a.id !== aula.id));
      setToast({ visible: true, message: "Aula excluída com sucesso!", type: "success" });
      closeDelete();
    } catch (err) {
      setToast({ visible: true, message: "Erro ao excluir: " + err.message, type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  /* =========================
     HELPERS
  ========================= */
  function formatDuracao(duracao) {
    if (!duracao) return "—";
    const partes = duracao.split(":");
    if (partes.length === 3) {
      if (partes[0] === "00") return `${partes[1]}min`;
      if (partes[1] === "00" && partes[2] === "00") return `${partes[0]}h`;
      return `${partes[0]}h ${partes[1]}min`;
    }
    return duracao;
  }

  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
  }

  /* =========================
     LOADING / ERRO
  ========================= */
  if (loading) {
    return (
      <div className="admin-page">
        <AdminHeader cursoNome={curso?.nome} />
        <main className="admin-main">
          <div className="admin-toolbar">
            <div className="skeleton" style={{ height: 40, width: 300, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 40, width: 120, borderRadius: 8 }} />
          </div>
          <div className="skeleton" style={{ height: 56, marginBottom: 16, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 56, marginBottom: 16, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 56, marginBottom: 16, borderRadius: 8 }} />
        </main>
      </div>
    );
  }

  if (error && !curso) {
    return (
      <div className="admin-page">
        <AdminHeader />
        <main className="admin-main">
          <div className="courses-error">
            <p>⚠️ {error}</p>
            <button className="btn-primary" onClick={() => navigate("/admin/cursos")}>
              Voltar para Cursos
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="admin-page">
      <AdminHeader cursoNome={curso?.nome} cursoId={cursoId} />
      
      <main className="admin-main">
        
        {/* CABEÇALHO */}
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <button 
              className="btn-secondary" 
              onClick={() => navigate("/admin/cursos")}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>←</span> Voltar
            </button>
            <h1 className="admin-title">
              Gerenciar Aulas
            </h1>
            <span className="admin-count">
              {curso?.nome} • {aulas.length} aula{aulas.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="admin-toolbar-right">
            <button className="btn-primary" onClick={openCreate}>
              + Nova Aula
            </button>
          </div>
        </div>

        {/* TABELA DE AULAS */}
        {aulas.length === 0 ? (
          <div className="admin-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16, opacity: 0.4 }}>
              <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p>Nenhuma aula cadastrada neste curso.</p>
            <button className="btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
              Criar primeira aula
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Título</th>
                  <th style={{ width: 120 }}>Duração</th>
                  <th>URL do Vídeo</th>
                  <th style={{ width: 150 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {aulas.map((aula, idx) => (
                  <tr key={aula.id}>
                    <td className="admin-td-number">{idx + 1}</td>
                    <td className="admin-td-name">
                      <strong>{aula.titulo}</strong>
                    </td>
                    <td>
                      <span className="admin-badge-duracao">
                        {formatDuracao(aula.duracao)}
                      </span>
                    </td>
                    <td>
                      {aula.url && (
                        <a 
                          href={aula.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="admin-link"
                        >
                          Ver vídeo
                        </a>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-edit"
                          onClick={() => openEdit(aula)}
                          title="Editar aula"
                        >
                          Editar
                        </button>
                        <button
                          className="admin-btn-delete"
                          onClick={() => openDelete(aula)}
                          title="Excluir aula"
                        >
                          Excluir
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

      {/* MODAL CRIAR/EDITAR AULA */}
      {formModal.open && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{formModal.mode === "create" ? "➕ Nova Aula" : "✏️ Editar Aula"}</h2>
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
                <label>Título da aula *</label>
                <input
                  name="titulo"
                  type="text"
                  placeholder="Ex: Introdução ao Curso"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={formErrors.titulo ? "input-error" : ""}
                  autoFocus
                />
                {formErrors.titulo && <span className="field-error">{formErrors.titulo}</span>}
              </div>

              <div className="modal-field">
                <label>URL do Vídeo *</label>
                <input
                  name="url"
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.url}
                  onChange={handleChange}
                  className={formErrors.url ? "input-error" : ""}
                />
                {formErrors.url && <span className="field-error">{formErrors.url}</span>}
                <small className="field-hint">
                  Use URL
                </small>
              </div>

              <div className="modal-field">
                <label>Duração (HH:MM:SS)</label>
                <input
                  name="duracao"
                  type="text"
                  placeholder="Ex: 00:15:30"
                  value={formData.duracao}
                  onChange={handleChange}
                  className={formErrors.duracao ? "input-error" : ""}
                />
                {formErrors.duracao && <span className="field-error">{formErrors.duracao}</span>}
                <small className="field-hint">
                   Formato: Horas:Minutos:Segundos (ex: 01:30:00 para 1h30min)
                </small>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : (formModal.mode === "create" ? "Criar Aula" : "Salvar Alterações")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR EXCLUSÃO */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={closeDelete}>
          <div className="modal-box modal-box--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Excluir Aula</h2>
              <button className="modal-close" onClick={closeDelete} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <p className="modal-delete-msg">
              Tem certeza que deseja excluir a aula
              <strong> "{deleteModal.aula?.titulo}"</strong>?
              <br />
              <span className="modal-delete-warn">⚠️ Esta ação não pode ser desfeita.</span>
            </p>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeDelete} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}

/* =========================
   HEADER ADMIN (versão para página de aulas)
========================= */
function AdminHeader({ cursoNome, cursoId }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <div className="admin-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" />
            <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span>Aprenda+</span>
          <span className="admin-badge">Admin</span>
        </div>
        {cursoNome && (
          <div className="admin-breadcrumb">
            <span 
              className="admin-breadcrumb-link" 
              onClick={() => navigate("/admin/cursos")}
            >
              Cursos
            </span>
            <span className="admin-breadcrumb-separator">/</span>
            <span className="admin-breadcrumb-current">{cursoNome}</span>
            <span className="admin-breadcrumb-separator">/</span>
            <span className="admin-breadcrumb-current">Aulas</span>
          </div>
        )}
      </div>

      <div className="admin-header-right">
        <div className="user-menu">
          <button className="user-pill-btn" onClick={() => setMenuOpen(v => !v)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="user-pill-name">Admin</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className={`user-pill-chevron${menuOpen ? " open" : ""}`}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="user-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="user-dropdown">
                <button
                  className="user-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/admin/cursos");
                  }}
                >
                  📚 Gerenciar Cursos
                </button>
                <hr className="user-divider" />
                <button
                  className="user-dropdown-item user-dropdown-logout"
                  onClick={() => { setMenuOpen(false); setShowConfirm(true); }}
                >
                  🚪 Sair da conta
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL LOGOUT */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box modal-box--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar logout</h2>
            </div>
            <p className="modal-delete-msg">Deseja realmente sair da sua conta?</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => { setShowConfirm(false); signOut(); }}>Sair</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
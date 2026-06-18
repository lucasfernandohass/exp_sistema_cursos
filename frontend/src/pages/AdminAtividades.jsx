import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiFetch from "../api";
import Toast from "../components/Toast";
import ThemeToggle from "../components/ThemeToggle";

export default function AdminAtividades() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAdmin } = useAuth();

  const [curso, setCurso] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de formulário
  const [formModal, setFormModal] = useState({ open: false, mode: "create", atividade: null });
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    questoes: [],
  });

  const TOTAL_QUESTOES = 10;

  function criarQuestoesVazias() {
    return Array.from({ length: TOTAL_QUESTOES }, (_, index) => ({
      id: Date.now() + index,
      enunciado: "",
      ordem: index + 1,
      alternativas: [
        { id: Date.now() + index * 10 + 1, texto: "", ordem: 1, correta: false },
        { id: Date.now() + index * 10 + 2, texto: "", ordem: 2, correta: false },
        { id: Date.now() + index * 10 + 3, texto: "", ordem: 3, correta: false },
        { id: Date.now() + index * 10 + 4, texto: "", ordem: 4, correta: false },
      ],
    }));
  }

  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Modal de exclusão
  const [deleteModal, setDeleteModal] = useState({ open: false, atividade: null });
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  /* =========================
     CARREGAR DADOS
  ========================= */
  const fetchCurso = useCallback(async () => {
    try {
      const data = await apiFetch(`/cursos/${cursoId}`, { token });
      setCurso(data);
    } catch (err) {
      setError("Erro ao carregar curso: " + err.message);
    }
  }, [cursoId, token]);

  const fetchAtividades = useCallback(async () => {
    try {
      const data = await apiFetch(`/atividades?cursoId=${cursoId}`, { token });
      setAtividades(data || []);
    } catch (err) {
      setError("Erro ao carregar atividades: " + err.message);
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
      await fetchAtividades();
      setLoading(false);
    };
    loadData();
  }, [isAdmin, navigate, fetchCurso, fetchAtividades]);

  /* =========================
     FUNÇÕES PARA GERENCIAR QUESTÕES
  ========================= */

  function handleQuestaoChange(index, field, value) {
    setFormData(prev => ({
      ...prev,
      questoes: prev.questoes.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  }

  function handleAlternativaChange(questaoIndex, altIndex, field, value) {
    setFormData(prev => ({
      ...prev,
      questoes: prev.questoes.map((q, qi) => {
        if (qi !== questaoIndex) return q;
        return {
          ...q,
          alternativas: q.alternativas.map((a, ai) =>
            ai === altIndex ? { ...a, [field]: value } : a
          ),
        };
      }),
    }));
  }

  function marcarCorreta(questaoIndex, altIndex) {
    setFormData(prev => ({
      ...prev,
      questoes: prev.questoes.map((q, qi) => {
        if (qi !== questaoIndex) return q;
        return {
          ...q,
          alternativas: q.alternativas.map((a, ai) => ({
            ...a,
            correta: ai === altIndex,
          })),
        };
      }),
    }));
  }

  /* =========================
     FORM HANDLERS
  ========================= */
  function openCreate() {
  setFormData({
    titulo: "",
    descricao: "",
    questoes: criarQuestoesVazias(),
  });
  setFormErrors({});
  setFormModal({ open: true, mode: "create", atividade: null });
}

  function openEdit(atividade) {

    let questoes = atividade.questoes?.map(q => ({
      ...q,
      id: q.id || Date.now() + Math.random(),
    })) || [];
    
    if (questoes.length < TOTAL_QUESTOES) {
      const questoesExistentes = questoes.length;
      for (let i = questoesExistentes; i < TOTAL_QUESTOES; i++) {
        questoes.push({
          id: Date.now() + i,
          enunciado: "",
          ordem: i + 1,
          alternativas: [
            { id: Date.now() + i * 10 + 1, texto: "", ordem: 1, correta: false },
            { id: Date.now() + i * 10 + 2, texto: "", ordem: 2, correta: false },
            { id: Date.now() + i * 10 + 3, texto: "", ordem: 3, correta: false },
            { id: Date.now() + i * 10 + 4, texto: "", ordem: 4, correta: false },
          ],
        });
      }
    }
    
    setFormData({
      titulo: atividade.titulo || "",
      descricao: atividade.descricao || "",
      questoes: questoes,
    });
    setFormErrors({});
    setFormModal({ open: true, mode: "edit", atividade });
  }

  function closeForm() {
    setFormModal({ open: false, mode: "create", atividade: null });
    setFormData({ titulo: "", descricao: "", questoes: [] });
  }

  function validate() {
    const errors = {};
    
    if (!formData.titulo.trim()) {
      errors.titulo = "Título é obrigatório";
    }
    
    const questoesVazias = formData.questoes.some(q => !q.enunciado.trim());
    if (questoesVazias) {
      errors.questoes = "Todas as 10 questões devem ter enunciado";
    }
    
    formData.questoes.forEach((q, i) => {
      const alternativasVazias = q.alternativas.some(a => !a.texto.trim());
      if (alternativasVazias) {
        errors[`questao_${i}`] = `Questão ${i + 1}: todas as 4 alternativas são obrigatórias`;
      }
      if (!q.alternativas.some(a => a.correta)) {
        errors[`correta_${i}`] = `Questão ${i + 1}: marque uma alternativa correta`;
      }
    });
    
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
      descricao: formData.descricao.trim() || null,
      cursoId: parseInt(cursoId),
      questoes: formData.questoes.map(q => ({
        enunciado: q.enunciado.trim(),
        ordem: q.ordem,
        alternativas: q.alternativas.map(a => ({
          texto: a.texto.trim(),
          ordem: a.ordem,
          correta: a.correta,
        })),
      })),
    };

    try {
      setSaving(true);
      
      if (formModal.mode === "create") {
        const created = await apiFetch("/atividades", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });
        setAtividades(prev => [...prev, created]);
        setToast({ visible: true, message: "Atividade criada com sucesso!", type: "success" });
      } else {
        const updated = await apiFetch(`/atividades/${formModal.atividade.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify(payload),
        });
        setAtividades(prev => prev.map(a => a.id === updated.id ? updated : a));
        setToast({ visible: true, message: "Atividade atualizada com sucesso!", type: "success" });
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
  function openDelete(atividade) {
    setDeleteModal({ open: true, atividade });
  }

  function closeDelete() {
    setDeleteModal({ open: false, atividade: null });
  }

  async function handleDelete() {
    const { atividade } = deleteModal;
    try {
      setDeleting(true);
      await apiFetch(`/atividades/${atividade.id}`, { method: "DELETE", token });
      setAtividades(prev => prev.filter(a => a.id !== atividade.id));
      setToast({ visible: true, message: "Atividade excluída com sucesso!", type: "success" });
      closeDelete();
    } catch (err) {
      setToast({ visible: true, message: "Erro ao excluir: " + err.message, type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  /* =========================
     LOADING / ERRO
  ========================= */
  if (loading) {
    return (
      <div className="admin-page">
        <AdminHeader user={user} cursoNome={curso?.nome} />
        <main className="admin-main">
          <div className="skeleton" style={{ height: 40, width: 300, borderRadius: 8, marginBottom: 20 }} />
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
        <AdminHeader user={user} />
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
      <AdminHeader user={user} cursoNome={curso?.nome} cursoId={cursoId} />

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
            <h1 className="admin-title">Gerenciar Atividades</h1>
            <span className="admin-count">
              {curso?.nome} • {atividades.length} atividade{atividades.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="admin-toolbar-right">
            <button className="btn-primary" onClick={openCreate}>
              + Nova Atividade
            </button>
          </div>
        </div>

        {/* LISTA DE ATIVIDADES */}
        {atividades.length === 0 ? (
          <div className="admin-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16, opacity: 0.4 }}>
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <p>Nenhuma atividade cadastrada para este curso.</p>
            <button className="btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
              Criar primeira atividade
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Questões</th>
                  <th style={{ width: 150 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {atividades.map((atividade, idx) => (
                  <tr key={atividade.id}>
                    <td className="admin-td-number">{idx + 1}</td>
                    <td className="admin-td-name">
                      <strong>{atividade.titulo}</strong>
                    </td>
                    <td>{atividade.descricao || <span className="admin-empty-cell">—</span>}</td>
                    <td>{atividade.questoes?.length || 0} questões</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-edit"
                          onClick={() => openEdit(atividade)}
                          title="Editar atividade"
                        >
                          Editar
                        </button>
                        <button
                          className="admin-btn-delete"
                          onClick={() => openDelete(atividade)}
                          title="Excluir atividade"
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

      {/* MODAL CRIAR/EDITAR ATIVIDADE */}
      {formModal.open && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-box modal-box--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{formModal.mode === "create" ? "Nova Atividade" : "Editar Atividade"}</h2>
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
                <label>Título da atividade *</label>
                <input
                  name="titulo"
                  type="text"
                  placeholder="Ex: Questionário - Módulo 1"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  className={formErrors.titulo ? "input-error" : ""}
                />
                {formErrors.titulo && <span className="field-error">{formErrors.titulo}</span>}
              </div>

              <div className="modal-field">
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  placeholder="Descreva a atividade..."
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="modal-field">
                <div className="questoes-header">
                  <label>Questões</label>
                </div>
                {formErrors.questoes && <span className="field-error">{formErrors.questoes}</span>}
              </div>

              {/* LISTA DE QUESTÕES */}
              <div className="questoes-list">
                {formData.questoes.map((questao, qi) => (
                  <div key={questao.id || qi} className="questao-card">
                    <div className="questao-header">
                      <h4>Questão {qi + 1}</h4>
                    </div>

                    <div className="modal-field">
                      <label>Enunciado *</label>
                      <textarea
                        value={questao.enunciado}
                        onChange={(e) => handleQuestaoChange(qi, "enunciado", e.target.value)}
                        rows={2}
                        placeholder="Digite o enunciado da questão..."
                        className={formErrors[`questao_${qi}`] ? "input-error" : ""}
                      />
                      {formErrors[`questao_${qi}`] && <span className="field-error">{formErrors[`questao_${qi}`]}</span>}
                    </div>

                    <div className="alternativas-list">
                      <label>Alternativas *</label>
                      {questao.alternativas.map((alt, ai) => (
                        <div key={alt.id || ai} className="alternativa-item">
                          <div className="alternativa-input">
                            <span className="alternativa-letra">{String.fromCharCode(65 + ai)}.</span>
                            <input
                              type="text"
                              value={alt.texto}
                              onChange={(e) => handleAlternativaChange(qi, ai, "texto", e.target.value)}
                              placeholder={`Alternativa ${String.fromCharCode(65 + ai)}`}
                              className={formErrors[`alternativa_${qi}_${ai}`] ? "input-error" : ""}
                            />
                          </div>
                          <button
                            type="button"
                            className={`btn-correta ${alt.correta ? "correta" : ""}`}
                            onClick={() => marcarCorreta(qi, ai)}
                          >
                            {alt.correta ? "✓ Correta" : "Marcar como correta"}
                          </button>
                        </div>
                      ))}
                      {formErrors[`correta_${qi}`] && <span className="field-error">{formErrors[`correta_${qi}`]}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {formData.questoes.length === 0 && (
                <div className="questoes-empty">
                  <p>Nenhuma questão adicionada. Clique em "Adicionar Questão" para começar.</p>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : (formModal.mode === "create" ? "Criar Atividade" : "Salvar Alterações")}
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
              <h2>🗑️ Excluir Atividade</h2>
              <button className="modal-close" onClick={closeDelete} aria-label="Fechar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <p className="modal-delete-msg">
              Tem certeza que deseja excluir a atividade
              <strong> "{deleteModal.atividade?.titulo}"</strong>?
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

      <ThemeToggle />
    </div>
  );
}

/* =========================
   HEADER ADMIN
========================= */
function AdminHeader({ user, cursoNome, cursoId }) {
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
            <span className="admin-breadcrumb-link" onClick={() => navigate("/admin/cursos")}>Cursos</span>
            <span className="admin-breadcrumb-separator">/</span>
            <span className="admin-breadcrumb-current">{cursoNome}</span>
            <span className="admin-breadcrumb-separator">/</span>
            <span className="admin-breadcrumb-current">Atividades</span>
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
            <span className="user-pill-name">{user?.nome?.split(" ")[0] || "Admin"}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className={`user-pill-chevron${menuOpen ? " open" : ""}`}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="user-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="user-dropdown">
                <div className="user-dropdown-name">{user?.nome}</div>
                <div className="user-dropdown-email">{user?.email}</div>
                <hr className="user-divider" />
                <button className="user-dropdown-item" onClick={() => { setMenuOpen(false); navigate("/admin/cursos"); }}>
                  Gerenciar Cursos
                </button>
                <hr className="user-divider" />
                <button className="user-dropdown-item user-dropdown-logout" onClick={() => { setMenuOpen(false); setShowConfirm(true); }}>
                  Sair da conta
                </button>
              </div>
            </>
          )}
        </div>
      </div>

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
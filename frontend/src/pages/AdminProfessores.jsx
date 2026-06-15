import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiFetch from "../api";
import ThemeToggle from "../components/ThemeToggle";

const EMPTY_FORM = {
  nome: "",
  email: "",
  senha: "",
  cpf: "",
  telefone: "",
  formacao: "",
  dataNascimento: "",
};

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // converter para milissegundos
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

function formatCPF(value) {
  if (!value) return "";
  const s = value.replace(/\D/g, '');
  const numbers = s.slice(0, 11);
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

function formatPhone(value) {
  if (!value) return "";
  const s = value.replace(/\D/g, '');
  const numbers = s.slice(0, 11);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCPF(cpf) {
  if (!cpf) return false;
  const s = cpf.replace(/\D/g, '');
  if (s.length !== 11) return false;
  if (/^([0-9])\1{10}$/.test(s)) return false;

  const nums = s.split('').map(Number);
  const calcCheck = (arr, factor) => {
    let total = 0;
    for (let i = 0; i < arr.length; i++) total += arr[i] * (factor - i);
    const mod = total % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calcCheck(nums.slice(0, 9), 10);
  const d2 = calcCheck(nums.slice(0, 9).concat(d1), 11);
  return d1 === nums[9] && d2 === nums[10];
}

export default function AdminProfessores() {
  const { user, token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formModal, setFormModal] = useState({ open: false, mode: "create", professor: null });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [deleteModal, setDeleteModal] = useState({ open: false, professor: null });
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin) navigate("/painel-aluno", { replace: true });
  }, [isAdmin, navigate]);

  const fetchProfessores = useCallback(async () => {
    // Verificar se o token está expirado
    if (isTokenExpired(token)) {
        console.log("Token expirado, redirecionando para login...");
        localStorage.removeItem('user');
        navigate('/login');
        return;
    }
    
    if (!token) {
        console.error("Token não disponível");
        setLoading(false);
        return;
    }
    
    try {
        setLoading(true);
        setError(null);
        
        const data = await apiFetch("/professores", { token });
        
        if (data && Array.isArray(data)) {
        setProfessores(data.filter(p => p !== null));
        } else {
        setProfessores([]);
        }
    } catch (err) {
        console.error("Erro ao carregar professores:", err);
        // Se for erro 401 ou 403, token pode estar expirado
        if (err.message.includes("401") || err.message.includes("403")) {
        localStorage.removeItem('user');
        navigate('/login');
        }
        setError(err.message);
        setProfessores([]);
    } finally {
        setLoading(false);
    }
    }, [token, navigate]);

  useEffect(() => {
    fetchProfessores();
  }, [fetchProfessores]);

  useEffect(() => {
    if (!feedback.message) return;
    const timer = setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
    return () => clearTimeout(timer);
  }, [feedback.message]);

  // Filtro seguro
  const filtered = Array.isArray(professores) ? professores.filter((p) => {
    if (!p || !p.nome) return false;
    const searchLower = search.toLowerCase();
    return (
      p.nome.toLowerCase().includes(searchLower) ||
      (p.email && p.email.toLowerCase().includes(searchLower)) ||
      (p.cpf && p.cpf.includes(search))
    );
  }) : [];

  function openCreate() {
    setFormData({ ...EMPTY_FORM });
    setFormErrors({});
    setFormModal({ open: true, mode: "create", professor: null });
  }

  function openEdit(professor) {
    if (!professor) return;

    setFormData({
      nome: professor.nome || "",
      email: professor.email || "",
      senha: "",
      cpf: formatCPF(professor.cpf || ""),
      telefone: formatPhone(professor.telefone || ""),
      formacao: professor.formacao || "",
      dataNascimento: professor.dataNascimento || "",
    });
    setFormErrors({});
    setFormModal({ open: true, mode: "edit", professor });
  }

  function closeForm() {
    setFormModal({ open: false, mode: "create", professor: null });
    setFormData(EMPTY_FORM);
    setFormErrors({});
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function handleCpfChange(e) {
    const formatted = formatCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
    if (formErrors.cpf) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.cpf;
        return newErrors;
      });
    }
  }

  function handlePhoneChange(e) {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, telefone: formatted }));
    if (formErrors.telefone) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.telefone;
        return newErrors;
      });
    }
  }

  function validate() {
    const errs = {};
    const cpfLimpo = formData.cpf ? formData.cpf.replace(/\D/g, '') : '';

    if (!formData.nome?.trim()) errs.nome = "Nome obrigatório.";
    
    if (!formData.email?.trim()) {
      errs.email = "Email obrigatório.";
    } else if (!validateEmail(formData.email.trim())) {
      errs.email = "Email inválido.";
    }
    
    if (formModal.mode === "create") {
      if (!formData.senha) {
        errs.senha = "Senha obrigatória.";
      } else if (formData.senha.length < 8) {
        errs.senha = "Senha deve ter no mínimo 8 caracteres.";
      }
    }
    
    if (!formData.cpf?.trim()) {
      errs.cpf = "CPF obrigatório.";
    } else if (cpfLimpo.length !== 11) {
      errs.cpf = "CPF deve ter 11 dígitos.";
    } else if (!validateCPF(formData.cpf)) {
      errs.cpf = "CPF inválido.";
    }
    
    if (formData.telefone?.trim()) {
      const telefoneLimpo = formData.telefone.replace(/\D/g, '');
      if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
        errs.telefone = "Telefone inválido. Use 10 ou 11 dígitos.";
      }
    }

    return errs;
  }

  async function handleSave(e) {
    e.preventDefault();
    
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : null,
        formacao: formData.formacao?.trim() || null,
        dataNascimento: formData.dataNascimento || null,
      };

      if (formModal.mode === "create") {
        payload.senha = formData.senha;
      }

      let response;
      if (formModal.mode === "create") {
        response = await apiFetch("/professores", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });
        setProfessores((prev) => [...prev, response]);
        setFeedback({ type: "success", message: "Professor criado com sucesso!" });
      } else {
        response = await apiFetch(`/professores/${formModal.professor.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify(payload),
        });
        setProfessores((prev) =>
          prev.map((p) => (p?.id === response.id ? { ...p, ...response } : p))
        );
        setFeedback({ type: "success", message: "Professor editado com sucesso!" });
      }
      
      closeForm();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setFormErrors({ _global: err.message || "Erro ao salvar professor" });
    } finally {
      setSaving(false);
    }
  }

  function openDelete(professor) {
    setDeleteModal({ open: true, professor });
  }

  function closeDelete() {
    setDeleteModal({ open: false, professor: null });
  }

  async function handleDelete() {
    const { professor } = deleteModal;
    try {
      setDeleting(true);
      await apiFetch(`/professores/${professor.id}`, { method: "DELETE", token });
      setProfessores((prev) => prev.filter((p) => p?.id !== professor.id));
      closeDelete();
      setFeedback({ type: "success", message: "Professor excluído com sucesso!" });
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  function formatCPFDisplay(cpf) {
    if (!cpf) return "—";
    const s = cpf.replace(/\D/g, '');
    if (s.length !== 11) return cpf;
    return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  function formatPhoneDisplay(telefone) {
    if (!telefone) return "—";
    const s = telefone.replace(/\D/g, '');
    if (s.length === 11) return s.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (s.length === 10) return s.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return telefone;
  }

  if (!isAdmin) return null;

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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 10 }} />
            ))}
          </div>
        </main>
        <ThemeToggle />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <AdminHeader user={user} />
        <main className="admin-main">
          <div className="courses-error">
            <p>⚠️ {error}</p>
            <button className="btn-primary" onClick={fetchProfessores}>Tentar novamente</button>
          </div>
        </main>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminHeader user={user} />

      <main className="admin-main">
        {feedback.message && (
          <div className={`admin-feedback admin-feedback--${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <button 
              className="btn-secondary" 
              onClick={() => navigate("/admin")} 
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>←</span> Voltar
            </button>
            <h1 className="admin-title">Gerenciar Professores</h1>
            <span className="admin-count">{professores.length} professor{professores.length !== 1 ? "es" : ""}</span>
          </div>
          <div className="admin-toolbar-right">
            <input
              className="admin-search"
              type="text"
              placeholder="Pesquisar professor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn-primary" onClick={openCreate}>
              + Novo Professor
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <p>{search ? `Nenhum professor encontrado para "${search}".` : "Nenhum professor cadastrado ainda."}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Formação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((professor) => (
                  <tr key={professor.id}>
                    <td className="admin-td-name">{professor.nome}</td>
                    <td>{professor.email}</td>
                    <td>{formatCPFDisplay(professor.cpf)}</td>
                    <td>{formatPhoneDisplay(professor.telefone)}</td>
                    <td>{professor.formacao || <span className="admin-empty-cell">—</span>}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-edit" onClick={() => openEdit(professor)}>Editar</button>
                        <button className="admin-btn-delete" onClick={() => openDelete(professor)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL CRIAR / EDITAR */}
      {formModal.open && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{formModal.mode === "create" ? "Novo Professor" : "Editar Professor"}</h2>
              <button className="modal-close" onClick={closeForm}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleSave}>
              {formErrors._global && <div className="auth-error">{formErrors._global}</div>}

              <div className="modal-field">
                <label>Nome completo *</label>
                <input name="nome" type="text" placeholder="Ex: João Silva" value={formData.nome} onChange={handleChange} className={formErrors.nome ? "input-error" : ""} />
                {formErrors.nome && <span className="field-error">{formErrors.nome}</span>}
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label>Email *</label>
                  <input name="email" type="email" placeholder="professor@email.com" value={formData.email} onChange={handleChange} className={formErrors.email ? "input-error" : ""} />
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </div>

                <div className="modal-field">
                  <label>CPF *</label>
                  <input name="cpf" type="text" placeholder="123.456.789-00" value={formData.cpf} onChange={handleCpfChange} maxLength={14} className={formErrors.cpf ? "input-error" : ""} />
                  {formErrors.cpf && <span className="field-error">{formErrors.cpf}</span>}
                </div>
              </div>

              {formModal.mode === "create" && (
                <div className="modal-field">
                  <label>Senha * (mínimo 8 caracteres)</label>
                  <input name="senha" type="password" placeholder="********" value={formData.senha} onChange={handleChange} className={formErrors.senha ? "input-error" : ""} />
                  {formErrors.senha && <span className="field-error">{formErrors.senha}</span>}
                </div>
              )}

              <div className="modal-row">
                <div className="modal-field">
                  <label>Telefone</label>
                  <input name="telefone" type="tel" placeholder="(11) 99999-9999" value={formData.telefone} onChange={handlePhoneChange} maxLength={15} className={formErrors.telefone ? "input-error" : ""} />
                  {formErrors.telefone && <span className="field-error">{formErrors.telefone}</span>}
                </div>

                <div className="modal-field">
                  <label>Data de Nascimento</label>
                  <input name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} />
                </div>
              </div>

              <div className="modal-field">
                <label>Formação / Especialização</label>
                <input name="formacao" type="text" placeholder="Ex: Mestre em Engenharia de Software" value={formData.formacao} onChange={handleChange} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? (formModal.mode === "create" ? "Criando..." : "Salvando...") : (formModal.mode === "create" ? "Criar Professor" : "Salvar Alterações")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXCLUSÃO */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={closeDelete}>
          <div className="modal-box modal-box--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Excluir Professor</h2>
              <button className="modal-close" onClick={closeDelete}>✕</button>
            </div>
            <p className="modal-delete-msg">
              Tem certeza que deseja excluir o professor <strong>"{deleteModal.professor?.nome}"</strong>?
              <br />
              <span className="modal-delete-warn">Esta ação não pode ser desfeita.</span>
            </p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeDelete} disabled={deleting}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ThemeToggle />
    </div>
  );
}

function AdminHeader({ user }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
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
      </div>

      <div className="admin-header-right">
        <div className="user-menu">
          <button className="user-pill-btn" onClick={() => setMenuOpen((v) => !v)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="user-pill-name">{user?.nome?.split(" ")[0]}</span>
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
                <button className="user-dropdown-item user-dropdown-logout" onClick={() => { setMenuOpen(false); setShowConfirm(true) }}>
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
              <button className="btn-primary" onClick={() => { setShowConfirm(false); signOut() }}>Sair</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
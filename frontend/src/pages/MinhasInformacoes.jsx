import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiFetch from "../api";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";
import DashboardNavbar from "../components/DashboardNavbar";

import "../styles/perfil.css";

export default function MinhasInformacoes() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    ra: "",
    telefone: "",
    dataNascimento: "",
    senha: "",
    confirmSenha: "",
  });

  /* =========================
     CARREGAR DADOS DO ALUNO
  ========================= */
  useEffect(() => {
    async function carregarDados() {
      if (!user || !token) return;
      
      try {
        setLoading(true);
        const data = await apiFetch(`/alunos/${user.id}`, { token });
        const telefoneFormatado = data.telefone ? formatPhoneDisplay(data.telefone) : "";
        const cpfFormatado = data.cpf ? formatCPFDisplay(data.cpf) : "";
        
        setFormData({
          nome: data.nome || "",
          email: data.email || "",
          cpf: cpfFormatado,
          ra: data.ra || "",
          telefone: telefoneFormatado,
          dataNascimento: data.dataNascimento || "",
          senha: "",
          confirmSenha: "",
        });
      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err);
        setFeedback({ type: "error", message: "Erro ao carregar dados: " + err.message });
      } finally {
        setLoading(false);
      }
    }
    
    carregarDados();
  }, [user, token]);

  /* =========================
     FUNÇÕES DE FORMATAÇÃO
  ========================= */
  function formatCPFDisplay(cpf) {
    if (!cpf) return "";
    const s = cpf.replace(/\D/g, '');
    if (s.length !== 11) return cpf;
    return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  function formatPhone(value) {
    const s = value.replace(/\D/g, '').slice(0, 11);
    if (s.length <= 2) return s;
    if (s.length <= 6) return `(${s.slice(0,2)}) ${s.slice(2)}`;
    if (s.length <= 10) return `(${s.slice(0,2)}) ${s.slice(2,6)}-${s.slice(6)}`;
    return `(${s.slice(0,2)}) ${s.slice(2,7)}-${s.slice(7)}`;
  }

  function formatPhoneDisplay(telefone) {
    if (!telefone) return "";
    const s = telefone.replace(/\D/g, '');
    if (s.length === 11) {
      return s.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (s.length === 10) {
      return s.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }

  /* =========================
     VALIDAÇÕES
  ========================= */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    const s = phone.replace(/\D/g, '');
    return s.length === 10 || s.length === 11 || s.length === 0;
  }

  function validate() {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório.";
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = "Email inválido.";
    }
    
    if (formData.telefone.trim()) {
      const telefoneLimpo = formData.telefone.replace(/\D/g, '');
      if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
        errors.telefone = "Telefone inválido. Use 10 ou 11 dígitos.";
      }
    }
    
    if (formData.senha && formData.senha.length > 0) {
      if (formData.senha.length < 8) {
        errors.senha = "Senha deve ter no mínimo 8 caracteres.";
      } else if (formData.senha !== formData.confirmSenha) {
        errors.confirmSenha = "As senhas não coincidem.";
      }
    }
    
    return errors;
  }

  /* =========================
     HANDLERS
  ========================= */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function handlePhoneChange(e) {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
    if (formErrors.telefone) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.telefone;
        return newErrors;
      });
    }
  }

  /* =========================
     SALVAR ALTERAÇÕES
  ========================= */
  async function handleSubmit(e) {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setSaving(true);
      setFeedback({ type: "", message: "" });
      
      const payload = {
        email: formData.email.trim(),
        telefone: formData.telefone.replace(/\D/g, '') || null,
        dataNascimento: formData.dataNascimento || null,
      };
      
      // Só envia senha se foi preenchida
      if (formData.senha && formData.senha.length > 0) {
        payload.senha = formData.senha;
      }
      
      await apiFetch(`/alunos/${user.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify(payload),
      });
      
      setFeedback({ type: "success", message: "Informações atualizadas com sucesso!" });
      
      // Limpa campos de senha
      setFormData(prev => ({
        ...prev,
        senha: "",
        confirmSenha: "",
      }));
      
    } catch (err) {
      console.error("❌ Erro ao atualizar:", err);
      setFeedback({ type: "error", message: err.message || "Erro ao atualizar informações." });
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main">
          <div className="dashboard-logo">
            <h1>Minhas Informações</h1>
          </div>
          <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
        </main>
        <ThemeToggle />
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="dashboard-layout">
      <DashboardNavbar />
      
      <main className="dashboard-main">
        <div className="minhas-informacoes-page">
          {/* Cabeçalho */}
          <div className="minhas-informacoes-header">
            <h1>Minhas Informações</h1>
            <p>Visualize e atualize seus dados pessoais</p>
          </div>
          
          {/* Feedback */}
          {feedback.message && (
            <div className={`admin-feedback admin-feedback--${feedback.type}`}>
              {feedback.message}
            </div>
          )}
          
          {/* Formulário */}
          <form className="perfil-form" onSubmit={handleSubmit}>
            <div className="perfil-grid">
              {/* NOME - Somente leitura */}
              <div className="perfil-field perfil-field--readonly">
                <label htmlFor="nome">Nome completo</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  readOnly
                  disabled
                  className="input-readonly"
                />
              </div>
              
              {/* EMAIL - Editável */}
              <div className="perfil-field">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? "input-error" : ""}
                  placeholder="seu@email.com"
                />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </div>
              
              {/* CPF - Somente leitura */}
              <div className="perfil-field perfil-field--readonly">
                <label htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  value={formData.cpf}
                  readOnly
                  disabled
                  className="input-readonly"
                />
              </div>
              
              {/* RA - Somente leitura */}
              <div className="perfil-field perfil-field--readonly">
                <label htmlFor="ra">Registro Acadêmico (RA)</label>
                <input
                  id="ra"
                  name="ra"
                  type="text"
                  value={formData.ra}
                  readOnly
                  disabled
                  className="input-readonly"
                />
              </div>
              
              {/* TELEFONE - Editável */}
              <div className="perfil-field">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  className={formErrors.telefone ? "input-error" : ""}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
                {formErrors.telefone && <span className="field-error">{formErrors.telefone}</span>}
              </div>
              
              {/* DATA DE NASCIMENTO - Editável */}
              <div className="perfil-field">
                <label htmlFor="dataNascimento">Data de Nascimento</label>
                <input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                />
              </div>
              
              {/* DIVISOR */}
              <hr className="perfil-divider" />
              
              {/* SENHA - Editável (opcional) */}
              <div className="perfil-field">
                <label htmlFor="senha">Nova senha <small>(opcional)</small></label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                  className={formErrors.senha ? "input-error" : ""}
                  placeholder="Deixe em branco para manter a atual"
                />
                {formErrors.senha && <span className="field-error">{formErrors.senha}</span>}
              </div>
              
              {/* CONFIRMAR SENHA - Editável */}
              <div className="perfil-field">
                <label htmlFor="confirmSenha">Confirmar nova senha</label>
                <input
                  id="confirmSenha"
                  name="confirmSenha"
                  type="password"
                  value={formData.confirmSenha}
                  onChange={handleChange}
                  className={formErrors.confirmSenha ? "input-error" : ""}
                  placeholder="Confirme a nova senha"
                />
                {formErrors.confirmSenha && <span className="field-error">{formErrors.confirmSenha}</span>}
              </div>
              
              {/* BOTÕES */}
              <div className="perfil-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate("/painel-aluno")}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <ThemeToggle />
      
      <Toast
        message={feedback.message}
        type={feedback.type}
        visible={!!feedback.message}
        onClose={() => setFeedback({ type: "", message: "" })}
      />
    </div>
  );
}
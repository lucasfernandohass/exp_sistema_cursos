import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiFetch from "../api";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";

export default function ProfessorDashboard() {
  const { user, token, isProfessor } = useAuth();
  const navigate = useNavigate();

  const [duvidas, setDuvidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursoSelecionado, setCursoSelecionado] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("pendentes");

  const [respostaModal, setRespostaModal] = useState({ open: false, duvida: null });
  const [resposta, setResposta] = useState("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  /* =========================
     PROTEÇÃO DE ROTA - APENAS PROFESSOR
  ========================= */
  useEffect(() => {
    if (!isProfessor) {
      navigate("/", { replace: true });
    }
  }, [isProfessor, navigate]);

  /* =========================
     CARREGAR DÚVIDAS DO PROFESSOR
  ========================= */
  const fetchDuvidas = useCallback(async () => {
    if (!token || !user) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await apiFetch(`/duvidas/professor/${user.id}/todas`, { token });
      setDuvidas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar dúvidas:", err);
      setError(err.message);
      setDuvidas([]);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (isProfessor) {
      fetchDuvidas();
    }
  }, [isProfessor, fetchDuvidas]);

  /* =========================
     EXTRAIR CURSOS DAS DÚVIDAS
  ========================= */
  const cursosDisponiveis = useMemo(() => {
    const cursosMap = new Map();
    duvidas.forEach((duvida) => {
      const id = duvida.cursoId;
      const nome = duvida.nomeCurso || `Curso ${id}`;
      if (id && !cursosMap.has(id)) {
        cursosMap.set(id, nome);
      }
    });
    return Array.from(cursosMap.entries()).map(([id, nome]) => ({ id, nome }));
  }, [duvidas]);

  /* =========================
     FILTROS
  ========================= */
  const duvidasFiltradas = duvidas.filter((duvida) => {
    const temResposta = duvida.resposta && duvida.resposta.trim() !== "";
    
    if (cursoSelecionado !== "todos") {
      const duvidaCursoId = duvida.cursoId;
      if (!duvidaCursoId || duvidaCursoId !== parseInt(cursoSelecionado)) {
        return false;
      }
    }
    
    if (statusFiltro === "pendentes" && temResposta) {
      return false;
    }
    if (statusFiltro === "respondidas" && !temResposta) {
      return false;
    }
    
    return true;
  });

  /* =========================
     ABRIR MODAL DE RESPOSTA
  ========================= */
  function openRespostaModal(duvida) {
    setRespostaModal({ open: true, duvida });
    setResposta(duvida.resposta || "");
  }

  function closeRespostaModal() {
    setRespostaModal({ open: false, duvida: null });
    setResposta("");
  }

  /* =========================
     ENVIAR RESPOSTA
  ========================= */
  async function handleEnviarResposta(e) {
    e.preventDefault();
    if (!resposta.trim()) {
      showToast("Digite uma resposta antes de enviar.", "error");
      return;
    }

    try {
      setEnviandoResposta(true);
      const data = await apiFetch(`/duvidas/${respostaModal.duvida.id}/responder`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ resposta: resposta.trim() }),
      });

      setDuvidas((prev) =>
        prev.map((d) =>
          d.id === data.id ? { ...d, ...data } : d
        )
      );

      showToast("Resposta enviada com sucesso!", "success");
      closeRespostaModal();
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
      showToast("Erro ao enviar resposta: " + err.message, "error");
    } finally {
      setEnviandoResposta(false);
    }
  }

  /* =========================
     HELPERS
  ========================= */
  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
  }

  function formatDate(dateString) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusClass(duvida) {
    const temResposta = duvida.resposta && duvida.resposta.trim() !== "";
    return temResposta ? "respondida" : "pendente";
  }

  function getStatusLabel(duvida) {
    const temResposta = duvida.resposta && duvida.resposta.trim() !== "";
    return temResposta ? "Respondida" : "Pendente";
  }

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="professor-page">
        <ProfessorHeader user={user} />
        <main className="professor-main">
          <div className="professor-loading">
            <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 80, borderRadius: 8, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 80, borderRadius: 8, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 80, borderRadius: 8 }} />
          </div>
        </main>
        <ThemeToggle />
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="professor-page">
      <ProfessorHeader user={user} />

      <main className="professor-main">
        <div className="professor-container">
          {/* HEADER */}
          <div className="professor-header">
            <h1>Minhas Dúvidas</h1>
            <p>Gerencie as dúvidas dos alunos nos cursos em que você é responsável.</p>
          </div>

          {/* FILTROS */}
          <div className="professor-filters">
            <div className="filter-group">
              <label>Curso</label>
              <select
                value={cursoSelecionado}
                onChange={(e) => setCursoSelecionado(e.target.value)}
              >
                <option value="todos">Todos os cursos</option>
                {cursosDisponiveis.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="pendentes">Pendentes</option>
                <option value="respondidas">Respondidas</option>
                <option value="todas">Todas</option>
              </select>
            </div>

            <div className="filter-stats">
              <span className="stat-item pendente">
                Pendentes: {duvidas.filter((d) => !d.resposta || d.resposta.trim() === "").length}
              </span>
              <span className="stat-item respondida">
                Respondidas: {duvidas.filter((d) => d.resposta && d.resposta.trim() !== "").length}
              </span>
            </div>
          </div>

          {/* LISTA DE DÚVIDAS */}
          {duvidasFiltradas.length === 0 ? (
            <div className="professor-empty">
              <div className="empty-icon">💬</div>
              <h3>Nenhuma dúvida encontrada</h3>
              <p>
                {statusFiltro === "pendentes"
                  ? "Ótimo! Não há dúvidas pendentes no momento."
                  : statusFiltro === "respondidas"
                  ? "Você ainda não respondeu nenhuma dúvida."
                  : "Nenhuma dúvida encontrada para os filtros selecionados."}
              </p>
            </div>
          ) : (
            <div className="duvidas-list">
              {duvidasFiltradas.map((duvida) => (
                <div key={duvida.id} className={`duvida-card ${getStatusClass(duvida)}`}>
                  <div className="duvida-header">
                    <div className="duvida-info">
                      <span className="duvida-aluno">{duvida.nomeAluno}</span>
                      <div className="duvida-detalhes-aula">
                        <span className="duvida-curso-nome">{duvida.nomeCurso}</span>
                        <span className="duvida-aula-titulo">{duvida.tituloVideoAula}</span>
                      </div>
                    </div>
                    <div className="duvida-meta">
                      <span className={`duvida-status ${getStatusClass(duvida)}`}>
                        {getStatusLabel(duvida)}
                      </span>
                      <span className="duvida-data">{formatDate(duvida.dataEnvio)}</span>
                    </div>
                  </div>

                  <div className="duvida-pergunta">
                    <p>{duvida.pergunta}</p>
                  </div>

                  {duvida.resposta && duvida.resposta.trim() !== "" && (
                    <div className="duvida-resposta-box">
                      <strong>Sua resposta:</strong>
                      <p>{duvida.resposta}</p>
                      <span className="resposta-data">
                        Respondido em {formatDate(duvida.dataResposta)}
                      </span>
                    </div>
                  )}

                  {(!duvida.resposta || duvida.resposta.trim() === "") && (
                    <div className="duvida-actions">
                      <button
                        className="btn-primary"
                        onClick={() => openRespostaModal(duvida)}
                      >
                        Responder
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE RESPOSTA */}
      {respostaModal.open && (
        <div className="modal-overlay" onClick={closeRespostaModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Responder Dúvida</h2>
              <button className="modal-close" onClick={closeRespostaModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="duvida-detalhe">
                <div className="detalhe-aluno">
                  <span className="detalhe-label">Aluno</span>
                  <span className="detalhe-valor">{respostaModal.duvida?.nomeAluno}</span>
                </div>
                <div className="detalhe-curso-aula">
                  <div className="detalhe-item">
                    <span className="detalhe-label">Curso</span>
                    <span className="detalhe-valor curso-nome-modal">{respostaModal.duvida?.nomeCurso}</span>
                  </div>
                  <div className="detalhe-item">
                    <span className="detalhe-label">Aula</span>
                    <span className="detalhe-valor aula-titulo-modal">{respostaModal.duvida?.tituloVideoAula}</span>
                  </div>
                </div>
                <div className="detalhe-pergunta">
                  <span className="detalhe-label">Pergunta</span>
                  <p className="detalhe-valor">{respostaModal.duvida?.pergunta}</p>
                </div>
              </div>

              <form onSubmit={handleEnviarResposta} className="resposta-form">
                <div className="modal-field">
                  <label>Sua resposta</label>
                  <textarea
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    rows={5}
                    placeholder="Digite sua resposta aqui..."
                    className="resposta-textarea"
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeRespostaModal}
                    disabled={enviandoResposta}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={enviandoResposta || !resposta.trim()}
                  >
                    {enviandoResposta ? "Enviando..." : "Enviar Resposta"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ThemeToggle />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}

/* =========================
   HEADER PROFESSOR
========================= */

function ProfessorHeader({ user }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="professor-header-bar">
      <div className="professor-header-left">
        <div className="professor-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" />
            <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span>Aprenda+</span>
          <span className="professor-badge">Professor</span>
        </div>
      </div>

      <div className="professor-header-right">
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
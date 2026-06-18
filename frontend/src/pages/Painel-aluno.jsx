import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listarMatriculas, cancelarMatricula, emitirCertificado, getCertificadoDownloadUrl } from "../api";
import apiFetch from "../api";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import ThemeToggle from "../components/ThemeToggle";
import DashboardNavbar from "../components/DashboardNavbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [atividadesProgresso, setAtividadesProgresso] = useState({});

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    cursoId: null,
    nomeCurso: "",
  });
  const [canceling, setCanceling] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [successBanner, setSuccessBanner] = useState(
    location.state?.enrolled ? location.state.cursoNome : null
  );

  // Estado para controlar emissão de certificado por curso
  const [emitindo, setEmitindo] = useState({});

  // 👇 NOVO: Armazena os códigos dos certificados já emitidos (cursoId -> codigo)
  const [certificadosEmitidos, setCertificadosEmitidos] = useState({});

  /* =========================
     CARREGAR MATRÍCULAS
  ========================= */
  const fetchMatriculas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarMatriculas(user.id, token);
      setMatriculas(data);
      
      // Buscar progresso de atividades
      await Promise.all(
        data.map(async (matricula) => {
          try {
            const progresso = await apiFetch(
              `/alunos/${user.id}/cursos/${matricula.cursoId}/atividades/progresso`,
              { token }
            );
            setAtividadesProgresso(prev => ({
              ...prev,
              [matricula.cursoId]: progresso
            }));
          } catch (err) {
            console.error("Erro ao buscar progresso de atividades:", err);
          }
        })
      );

      // 👇 Buscar certificados já emitidos para obter os códigos
      try {
        const certificados = await apiFetch(`/certificados/aluno/${user.id}`, { token });
        if (Array.isArray(certificados)) {
          const codigosMap = {};
          certificados.forEach(cert => {
            if (cert.cursoId) {
              codigosMap[cert.cursoId] = cert.codigoValidacao;
            }
          });
          setCertificadosEmitidos(codigosMap);
        }
      } catch (err) {
        console.error("Erro ao buscar certificados:", err);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.id, token]);

  useEffect(() => {
    fetchMatriculas();
  }, [fetchMatriculas]);

  useEffect(() => {
    if (!successBanner) return;
    const timer = setTimeout(() => setSuccessBanner(null), 5000);
    return () => clearTimeout(timer);
  }, [successBanner]);

  /* =========================
     CANCELAR MATRÍCULA
  ========================= */
  function handleCancelClick(matricula) {
    setConfirmModal({
      visible: true,
      cursoId: matricula.cursoId,
      nomeCurso: matricula.nomeCurso,
    });
  }

  async function handleConfirmCancel() {
    const { cursoId } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, visible: false }));
    try {
      setCanceling(true);
      await cancelarMatricula(user.id, cursoId, token);
      setMatriculas((prev) => prev.filter((m) => m.cursoId !== cursoId));
    } catch (err) {
      setToast({ visible: true, message: "Erro ao cancelar matrícula: " + err.message, type: "error" });
    } finally {
      setCanceling(false);
    }
  }

  /* =========================
     EMITIR CERTIFICADO
  ========================= */
  async function handleEmitirCertificado(cursoId, nomeCurso) {
    if (emitindo[cursoId]) return;

    setEmitindo((prev) => ({ ...prev, [cursoId]: true }));

    try {
      const response = await emitirCertificado(user.id, cursoId, token);
      const codigo = response.codigoValidacao;
      if (!codigo) {
        throw new Error("Código de validação não retornado.");
      }

      // Salva o código no estado
      setCertificadosEmitidos(prev => ({
        ...prev,
        [cursoId]: codigo
      }));

      // Baixa o PDF
      const downloadUrl = getCertificadoDownloadUrl(codigo);
      const pdfResponse = await fetch(`http://localhost:8080${downloadUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!pdfResponse.ok) {
        throw new Error("Erro ao baixar o PDF do certificado.");
      }

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado_${codigo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Atualiza a matrícula para mostrar o certificado disponível (opcional)
      setMatriculas(prev =>
        prev.map(m =>
          m.cursoId === cursoId
            ? { ...m, certificadoDisponivel: true }
            : m
        )
      );

      setToast({
        visible: true,
        message: `Certificado do curso "${nomeCurso}" emitido com sucesso!`,
        type: "success",
      });
    } catch (err) {
      console.error("Erro ao emitir certificado:", err);
      setToast({
        visible: true,
        message: err.message || "Erro ao emitir certificado. Tente novamente.",
        type: "error",
      });
    } finally {
      setEmitindo((prev) => ({ ...prev, [cursoId]: false }));
    }
  }

  /* =========================
     BAIXAR CERTIFICADO (já emitido)
  ========================= */
  async function baixarCertificado(cursoId) {
    let codigo = certificadosEmitidos[cursoId];

    if (!codigo) {
      try {
        const certificados = await apiFetch(`/certificados/aluno/${user.id}`, { token });
        const cert = certificados.find(c => c.cursoId === cursoId);
        if (cert) {
          codigo = cert.codigoValidacao;
          setCertificadosEmitidos(prev => ({ ...prev, [cursoId]: codigo }));
        } else {
          setToast({ visible: true, message: "Certificado não encontrado.", type: "error" });
          return;
        }
      } catch (err) {
        setToast({ visible: true, message: "Erro ao buscar certificado: " + err.message, type: "error" });
        return;
      }
    }

    try {
      const downloadUrl = getCertificadoDownloadUrl(codigo);
      const response = await fetch(`http://localhost:8080${downloadUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Erro ao baixar: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado_${codigo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ visible: true, message: "Erro ao baixar certificado: " + err.message, type: "error" });
    }
  }

  /* =========================
     HELPERS
  ========================= */
  function progressPercent(m) {
    if (!m.totalAulas) return 0;
    return Math.round((m.aulasConcluidas / m.totalAulas) * 100);
  }

  function progressoAtividades(cursoId) {
    const p = atividadesProgresso[cursoId];
    if (!p) return 0;
    return Math.round((p.respondidas / p.total) * 100) || 0;
  }

  function atividadesConcluidas(cursoId) {
    const p = atividadesProgresso[cursoId];
    if (!p) return 0;
    return p.respondidas || 0;
  }

  function totalAtividades(cursoId) {
    const p = atividadesProgresso[cursoId];
    if (!p) return 0;
    return p.total || 0;
  }

  function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }

  function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }

  const stats = (() => {
    const total = matriculas.length;
    const concluidos = matriculas.filter(m => progressPercent(m) === 100).length;
    const andamento = total - concluidos;
    return { total, andamento, concluidos };
  })();

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div className="skeleton" style={{ height: 36, width: 280, borderRadius: 10, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 20, width: 200, borderRadius: 8 }} />
          </div>
          <div className="dashboard-content">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 140, borderRadius: 12 }} />
                <div className="card-content">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-btn" style={{ marginTop: 12 }} />
                </div>
              </div>
            ))}
          </div>
        </main>
        <ThemeToggle />
      </div>
    );
  }

  /* =========================
     ERRO
  ========================= */
  if (error) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main">
          <div className="courses-error">
            <p>⚠️ {error}</p>
            <button className="btn-primary" onClick={fetchMatriculas}>Tentar novamente</button>
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
    <div className="dashboard-layout">
      <DashboardNavbar />
      <div className="dashboard-main-wrapper">
        <main className="dashboard-main">

          {/* HEADER */}
          <div className="dashboard-header">
            <h1 className="dashboard-greeting">
              {greeting()}, {user.nome?.split(" ")[0]}! 👋
            </h1>
            <p className="dashboard-subtitle">
              {matriculas.length > 0
                ? `Você tem ${matriculas.length} curso${matriculas.length > 1 ? "s" : ""} em andamento.`
                : "Explore o catálogo e comece a aprender."}
            </p>
          </div>

          {/* BANNER DE SUCESSO */}
          {successBanner && (
            <div className="dashboard-banner-success">
              <span className="dashboard-banner-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>Matrícula em <strong>"{successBanner}"</strong> confirmada! Aproveite o curso.</span>
              <button className="dashboard-banner-close" onClick={() => setSuccessBanner(null)}>✕</button>
            </div>
          )}

          {/* STATS ROW */}
          {matriculas.length > 0 && (
            <div className="dashboard-stats">
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-number">{stats.total}</span>
                <span className="dashboard-stat-label">Cursos</span>
              </div>
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-number">{stats.andamento}</span>
                <span className="dashboard-stat-label">Em andamento</span>
              </div>
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-number">{stats.concluidos}</span>
                <span className="dashboard-stat-label">Concluídos</span>
              </div>
            </div>
          )}

          {/* VAZIO */}
          {matriculas.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 10V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <h2>Nenhum curso matriculado</h2>
              <p>Explore nosso catálogo e comece a aprender hoje mesmo!</p>
              <button className="btn-primary" onClick={() => navigate("/cursos")}>
                Ver Catálogo
              </button>
            </div>
          ) : (
            /* GRID DE MATRÍCULAS */
            <div className="dashboard-content">
              {matriculas.map((m) => {
                const progress = progressPercent(m);
                const progressAtividades = progressoAtividades(m.cursoId);
                const totalAtv = totalAtividades(m.cursoId);
                const concluidasAtv = atividadesConcluidas(m.cursoId);

                const aulasConcluidas = progress === 100;
                const todasAtividadesConcluidas = totalAtv > 0 ? progressAtividades === 100 : true;
                const cursoConcluido = aulasConcluidas && todasAtividadesConcluidas;

                // Verifica se o certificado já foi emitido (pelo estado ou pelo campo da matrícula)
                const certificadoJaEmitido = m.certificadoDisponivel || !!certificadosEmitidos[m.cursoId];

                return (
                  <div key={m.cursoId} className="card">

                    {/* BANNER */}
                    {m.urlBanner ? (
                      <img
                        src={m.urlBanner}
                        alt={m.nomeCurso}
                        className="course-image"
                        style={{ borderRadius: "12px 12px 0 0" }}
                      />
                    ) : (
                      <div className="course-image-placeholder" style={{ height: 130, borderRadius: "12px 12px 0 0" }}>
                        <span className="course-initials">{getInitials(m.nomeCurso)}</span>
                      </div>
                    )}

                    <div className="card-content">

                      {/* NOME + PROFESSOR */}
                      <h3>{m.nomeCurso}</h3>
                      <p className="course-meta">{m.nomeProfessor}</p>

                      {/* PROGRESSO AULAS */}
                      <div className="enrolled-progress-header">
                        <span className="course-meta">Progresso das aulas</span>
                        <span className="enrolled-progress-pct">{progress}%</span>
                      </div>
                      <div className="dashboard-progress-bar">
                        <div className="dashboard-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="course-meta" style={{ fontSize: "0.8rem" }}>
                        {m.aulasConcluidas} de {m.totalAulas} aulas concluídas
                      </p>

                      {/* PROGRESSO ATIVIDADES */}
                      {totalAtv > 0 && (
                        <>
                          <div className="enrolled-progress-header" style={{ marginTop: "8px" }}>
                            <span className="course-meta">Progresso das atividades</span>
                            <span className="enrolled-progress-pct">{progressAtividades}%</span>
                          </div>
                          <div className="dashboard-progress-bar">
                            <div className="dashboard-progress-fill" style={{ 
                              width: `${progressAtividades}%`,
                              background: "linear-gradient(90deg, #8b5cf6, #a78bfa)"
                            }} />
                          </div>
                          <p className="course-meta" style={{ fontSize: "0.8rem" }}>
                            {concluidasAtv} de {totalAtv} atividades concluídas
                          </p>
                        </>
                      )}

                      {/* MÉDIA */}
                      {m.mediaFinal != null && (
                        <p className="enrolled-media">
                          Média: <strong>{m.mediaFinal.toFixed(1)}</strong>
                        </p>
                      )}

                      {/* PAGAMENTO */}
                      <div className="enrolled-payment-row">
                        <span className={`payment-status payment-status--${m.statusPagamento?.toLowerCase()}`}>
                          {m.statusPagamento}
                        </span>
                        <span className="course-meta" style={{ fontSize: "0.78rem" }}>
                          {m.modalidadePagamento === "PARCELADO"
                            ? `${m.numeroParcelas}x parcelado`
                            : "À vista"}
                        </span>
                      </div>

                      {/* DATA */}
                      <p className="course-meta" style={{ fontSize: "0.78rem" }}>
                        Matriculado em {formatDate(m.dataMatricula)}
                      </p>

                      {/* CERTIFICADO DISPONÍVEL (se já emitido) */}
                      {certificadoJaEmitido && (
                        <p className="enrolled-certificate">✅ Certificado disponível</p>
                      )}

                    </div>

                    {/* AÇÕES */}
                    <div className="enrolled-actions" style={{ flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                        <button
                          className="btn-primary"
                          onClick={() => navigate(`/aula/${m.cursoId}`)}
                          style={{ flex: 1 }}
                        >
                          Assistir aulas
                        </button>
                        <button
                          className="btn-atividades"
                          onClick={() => navigate(`/painel-aluno/atividades/${m.cursoId}`)}
                          style={{ flex: 1 }}
                        >
                          Atividades
                        </button>
                      </div>

                      {/* Botão de emissão (se concluído e não emitido) */}
                      {cursoConcluido && !certificadoJaEmitido && (
                        <button
                          className="btn-certificado"
                          onClick={() => handleEmitirCertificado(m.cursoId, m.nomeCurso)}
                          disabled={emitindo[m.cursoId]}
                          style={{
                            width: "100%",
                            padding: "0.7rem",
                            borderRadius: "var(--radius)",
                            border: "none",
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            color: "white",
                            fontWeight: 600,
                            cursor: emitindo[m.cursoId] ? "wait" : "pointer",
                            opacity: emitindo[m.cursoId] ? 0.7 : 1,
                            transition: "all 0.2s",
                          }}
                        >
                          {emitindo[m.cursoId] ? "⏳ Emitindo..." : "Emitir Certificado"}
                        </button>
                      )}

                      {/* Botão de download (se já emitido) */}
                      {certificadoJaEmitido && (
                        <button
                          className="btn-certificado"
                          onClick={() => baixarCertificado(m.cursoId)}
                          style={{
                            width: "100%",
                            padding: "0.7rem",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--brand-blue)",
                            background: "transparent",
                            color: "var(--brand-blue)",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "rgba(37, 99, 235, 0.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "transparent";
                          }}
                        >
                          Baixar Certificado
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      <ThemeToggle />

      {/* MODAL CANCELAMENTO */}
      <ConfirmModal
        visible={confirmModal.visible}
        title="Cancelar matrícula"
        message={`Deseja cancelar sua matrícula em "${confirmModal.nomeCurso}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />

      {/* TOAST */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { useAuth } from "../context/AuthContext";
import {
  detalharCurso,
  marcarAulaAssistida,
  cursoConcluido,
  listarDuvidas,
  enviarDuvida,
} from "../api";
import ThemeToggle from "../components/ThemeToggle";
import DashboardNavbar from "../components/DashboardNavbar";

import "../styles/aula.css";
import "../styles/course-page.css";

export default function Aula() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [curso, setCurso] = useState(null);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [aulaIndex, setAulaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursoCompleto, setCursoCompleto] = useState(false);
  const [duvidas, setDuvidas] = useState([]);
  const [novaDuvida, setNovaDuvida] = useState("");
  const [enviandoDuvida, setEnviandoDuvida] = useState(false);
  const [carregandoDuvidas, setCarregandoDuvidas] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  
  const videoMarcadoRef = useRef(false);
  const playerRef = useRef(null);
  const duvidasCarregadasRef = useRef(false);
  const conclusaoVerificadaRef = useRef(false);

  /* =========================
     EXTRAIR ID DO YOUTUBE
  ========================= */
  function getReactPlayerUrl(url) {
    if (!url) return '';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = null;
      
      if (url.includes('/embed/')) {
        videoId = url.split('/embed/')[1].split('?')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('/shorts/')) {
        videoId = url.split('/shorts/')[1].split('?')[0];
      }
      
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    return url;
  }

  /* =========================
     EXIBIR BANNER
  ========================= */
  function showBannerMessage(message) {
    setBannerMessage(message);
    setShowBanner(true);
    setTimeout(() => {
      setShowBanner(false);
    }, 3000);
  }

  /* =========================
     CARREGAR DADOS DO CURSO
  ========================= */
  const fetchCurso = useCallback(async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await detalharCurso(id, token);
      
      if (!data) {
        throw new Error("Curso não encontrado");
      }
      
      setCurso(data);
      
      if (data.videoAulas && data.videoAulas.length > 0) {
        const primeiraNaoAssistida = data.videoAulas.findIndex(aula => !aula.assistida);
        const index = primeiraNaoAssistida !== -1 ? primeiraNaoAssistida : 0;
        setAulaIndex(index);
        setAulaAtual(data.videoAulas[index]);
      }
      
      if (!conclusaoVerificadaRef.current) {
        conclusaoVerificadaRef.current = true;
        try {
          const completo = await cursoConcluido(user.id, id, token);
          setCursoCompleto(completo === true);
        } catch {
          setCursoCompleto(false);
        }
      }
      
    } catch (err) {
      setError(err.message || "Erro ao carregar curso");
    } finally {
      setLoading(false);
    }
  }, [id, user, token]);

  useEffect(() => {
    fetchCurso();
  }, [fetchCurso]);

  /* =========================
     CARREGAR DÚVIDAS
  ========================= */
  useEffect(() => {
    async function carregarDuvidas() {
      if (!aulaAtual?.id) return;
      if (duvidasCarregadasRef.current) return;
      if (carregandoDuvidas) return;
      
      duvidasCarregadasRef.current = true;
      setCarregandoDuvidas(true);
      
      try {
        const data = await listarDuvidas(aulaAtual.id, token);
        setDuvidas(data || []);
      } catch {
        setDuvidas([]);
      } finally {
        setCarregandoDuvidas(false);
      }
    }
    
    carregarDuvidas();
  }, [aulaAtual, token]);

  /* =========================
     Resetar flags quando mudar de aula
  ========================= */
  useEffect(() => {
    duvidasCarregadasRef.current = false;
    videoMarcadoRef.current = false;
  }, [aulaIndex, aulaAtual]);

  /* =========================
     MARCAR AULA
  ========================= */
  const marcarAula = useCallback(async () => {
    if (!aulaAtual || aulaAtual.assistida) return;
    if (videoMarcadoRef.current) return;
    
    videoMarcadoRef.current = true;
    
    try {
      await marcarAulaAssistida(user.id, aulaAtual.id, token);
      
      setAulaAtual(prev => ({ ...prev, assistida: true }));
      setCurso(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          videoAulas: prev.videoAulas?.map(aula =>
            aula.id === aulaAtual.id ? { ...aula, assistida: true } : aula
          ) || []
        };
      });
      
      showBannerMessage("Aula concluída!");
      
      try {
        const completo = await cursoConcluido(user.id, id, token);
        setCursoCompleto(completo === true);
      } catch {
        // Erro silencioso
      }
      
    } catch {
      videoMarcadoRef.current = false;
      showBannerMessage("Erro ao marcar aula");
    }
  }, [aulaAtual, user, token, id]);

  /* =========================
     EVENTOS DO PLAYER
  ========================= */
  const handleEnded = () => {
    marcarAula();
  };

  const handleError = () => {
    showBannerMessage("Erro ao carregar o vídeo");
  };

  /* =========================
     NAVEGAÇÃO ENTRE AULAS
  ========================= */
  function proximaAula() {
    if (!curso?.videoAulas) return;
    
    if (aulaIndex + 1 < curso.videoAulas.length) {
      const novoIndex = aulaIndex + 1;
      setAulaIndex(novoIndex);
      setAulaAtual(curso.videoAulas[novoIndex]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function aulaAnterior() {
    if (!curso?.videoAulas) return;
    
    if (aulaIndex > 0) {
      const novoIndex = aulaIndex - 1;
      setAulaIndex(novoIndex);
      setAulaAtual(curso.videoAulas[novoIndex]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /* =========================
     ENVIAR DÚVIDA
  ========================= */
  async function handleEnviarDuvida(e) {
    e.preventDefault();
    if (!novaDuvida.trim() || !aulaAtual) return;
    
    try {
      setEnviandoDuvida(true);
      const data = await enviarDuvida(user.id, {
        pergunta: novaDuvida,
        videoAulaId: aulaAtual.id
      }, token);
      
      setDuvidas(prev => [data, ...(prev || [])]);
      setNovaDuvida("");
      showBannerMessage("Dúvida enviada!");
    } catch {
      showBannerMessage("Erro ao enviar dúvida");
    } finally {
      setEnviandoDuvida(false);
    }
  }

  /* =========================
     HELPERS
  ========================= */
  const progresso = curso?.videoAulas?.length
    ? Math.round((curso.videoAulas.filter(a => a.assistida).length / curso.videoAulas.length) * 100)
    : 0;

  function formatDuracao(duracao) {
    if (!duracao) return null;
    const partes = duracao.split(":");
    if (partes.length === 3) {
      if (partes[0] === "00") return `${partes[1]}min`;
      return `${partes[0]}h ${partes[1]}min`;
    }
    return duracao;
  }

  const videoUrl = aulaAtual?.url ? getReactPlayerUrl(aulaAtual.url) : '';
  const canPlay = videoUrl ? ReactPlayer.canPlay(videoUrl) : false;

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main aula-loading">
          <div className="aula-loading-skeleton">
            <div className="skeleton aula-skeleton-video" />
            <div className="skeleton aula-skeleton-info" />
          </div>
        </main>
        <ThemeToggle />
      </div>
    );
  }

  /* =========================
     ERRO
  ========================= */
  if (error || !curso) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main">
          <div className="aula-error-container">
            <div className="aula-error-icon">⚠️</div>
            <h2>Ops! Algo deu errado</h2>
            <p>{error || "Curso não encontrado"}</p>
            <button className="btn-primary" onClick={() => navigate("/painel-aluno")}>
              Voltar ao Painel
            </button>
          </div>
        </main>
        <ThemeToggle />
      </div>
    );
  }

  if (!aulaAtual) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main">
          <div className="aula-error-container">
            <div className="aula-error-icon">📹</div>
            <h2>Nenhuma aula disponível</h2>
            <p>Este curso ainda não possui aulas cadastradas.</p>
            <button className="btn-primary" onClick={() => navigate("/painel-aluno")}>
              Voltar ao Painel
            </button>
          </div>
        </main>
        <ThemeToggle />
      </div>
    );
  }

  /* =========================
     RENDER PRINCIPAL
  ========================= */
  return (
    <div className="dashboard-layout aula-page">
      <DashboardNavbar />
      
      <main className="dashboard-main aula-main">
        
        {/* BANNER DE NOTIFICAÇÃO */}
        {showBanner && (
          <div className="aula-banner">
            <span className="aula-banner-icon">✓</span>
            <span className="aula-banner-message">{bannerMessage}</span>
            <button 
              className="aula-banner-close"
              onClick={() => setShowBanner(false)}
            >
              ×
            </button>
          </div>
        )}
        
        {/* HEADER COM PROGRESSO */}
        <div className="aula-header">
          <div className="aula-header-left">
            <button 
              className="aula-back-btn"
              onClick={() => navigate("/painel-aluno")}
            >
              ← Voltar
            </button>
            <div className="aula-header-info">
              <h1 className="aula-curso-titulo">{curso.nome}</h1>
              <span className="aula-aula-titulo">{aulaAtual.titulo}</span>
            </div>
          </div>
          
          <div className="aula-progress-card">
            <div className="aula-progress-info">
              <span className="aula-progress-label">Progresso do curso</span>
              <span className="aula-progress-percent">{progresso}%</span>
            </div>
            <div className="aula-progress-bar">
              <div className="aula-progress-fill" style={{ width: `${progresso}%` }} />
            </div>
            <div className="aula-progress-stats">
              <span>{curso.videoAulas?.filter(a => a.assistida).length || 0} de {curso.videoAulas?.length || 0} aulas</span>
            </div>
          </div>
        </div>

        {/* PLAYER + CONTEÚDO LATERAL */}
        <div className="aula-content-grid">
          
          {/* COLUNA ESQUERDA: VÍDEO */}
          <div className="aula-video-col">
            <div className="aula-video-card">
              <div className="aula-video-wrapper">
                {videoUrl && canPlay ? (
                  <ReactPlayer
                    ref={playerRef}
                    src={videoUrl}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false}
                    onEnded={handleEnded}
                    onError={handleError}
                    config={{
                      youtube: {
                        playerVars: {
                          modestbranding: 1,
                          rel: 0,
                          showinfo: 0,
                          controls: 1,
                          fs: 1,
                          playsinline: 1,
                        }
                      },
                      vimeo: {
                        playerOptions: {
                          byline: false,
                          portrait: false,
                          title: false,
                          controls: true,
                          responsive: true,
                        }
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      borderRadius: '16px',
                      overflow: 'hidden'
                    }}
                  />
                ) : (
                  <div className="aula-video-placeholder">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                      <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <p>Vídeo indisponível</p>
                  </div>
                )}
              </div>
              
              <div className="aula-video-footer">
                <div className="aula-video-title-section">
                  <h2>{aulaAtual.titulo}</h2>
                  {aulaAtual.duracao && (
                    <span className="aula-duracao-badge">{formatDuracao(aulaAtual.duracao)}</span>
                  )}
                </div>
                
                <div className="aula-video-actions">
                  {aulaAtual.assistida && (
                    <span className="aula-completed-badge">✓ Aula concluída</span>
                  )}
                  
                  <div className="aula-nav-buttons">
                    <button
                      className="aula-nav-btn prev"
                      onClick={aulaAnterior}
                      disabled={aulaIndex === 0}
                    >
                      ← Aula anterior
                    </button>
                    <button
                      className="aula-nav-btn next"
                      onClick={proximaAula}
                      disabled={aulaIndex + 1 >= (curso.videoAulas?.length || 0)}
                    >
                      Próxima aula →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: DÚVIDAS */}
          <div className="aula-sidebar-col">
            <div className="aula-card">
              <div className="aula-card-header">
                <span className="aula-card-icon"></span>
                <h3>Dúvidas sobre esta aula</h3>
                <span className="aula-duvidas-count">{duvidas.length}</span>
              </div>
              <div className="aula-card-body">
                <form onSubmit={handleEnviarDuvida} className="nova-duvida-form">
                  <textarea
                    className="nova-duvida-input"
                    placeholder="Tem alguma dúvida? Pergunte ao professor..."
                    value={novaDuvida}
                    onChange={(e) => setNovaDuvida(e.target.value)}
                    rows={2}
                  />
                  <button 
                    type="submit" 
                    className="btn-primary nova-duvida-btn"
                    disabled={enviandoDuvida || !novaDuvida.trim()}
                  >
                    {enviandoDuvida ? "Enviando..." : "Enviar dúvida"}
                  </button>
                </form>
                
                <div className="duvidas-divider" />
                
                {carregandoDuvidas ? (
                  <div className="aula-empty-state">
                    <span>⌛</span>
                    <p>Carregando dúvidas...</p>
                  </div>
                ) : !duvidas || duvidas.length === 0 ? (
                  <div className="aula-empty-state">
                    <span className="aula-empty-state-icon">💬</span>
                    <p>Nenhuma dúvida ainda. Seja o primeiro a perguntar!</p>
                  </div>
                ) : (
                  <div className="duvidas-lista">
                    {duvidas.map(duvida => (
                      <div key={duvida.id} className="duvida-item">
                        <div className="duvida-header">
                          <div className="duvida-aluno">
                            <span className="duvida-avatar">{duvida.nomeAluno?.charAt(0)}</span>
                            <strong>{duvida.nomeAluno}</strong>
                          </div>
                          <span className="duvida-data">{new Date(duvida.dataEnvio).toLocaleDateString()}</span>
                        </div>
                        <p className="duvida-pergunta">{duvida.pergunta}</p>
                        {duvida.resposta && (
                          <div className="duvida-resposta">
                            <div className="duvida-resposta-header">
                              <span className="duvida-resposta-avatar"></span>
                              <strong>Professor(a) {duvida.nomeProfessor}</strong>
                            </div>
                            <p>{duvida.resposta}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LISTA DE AULAS DO CURSO */}
        <div className="aula-conteudo-card">
          <div className="aula-card-header">
            <span className="aula-card-icon"></span>
            <h3>Conteúdo do curso ({curso.videoAulas?.length || 0} aulas)</h3>
          </div>
          <div className="aulas-grid">
            {curso.videoAulas?.map((aula, idx) => {
              const isAssistida = aula.assistida === true;
              const isAtual = aulaIndex === idx;
              
              return (
                <button
                  key={aula.id}
                  className={`aula-list-item ${isAtual ? "active" : ""} ${isAssistida ? "completed" : ""}`}
                  onClick={() => {
                    setAulaIndex(idx);
                    setAulaAtual(aula);
                  }}
                >
                  <span className="aula-list-number">{idx + 1}</span>
                  <span className="aula-list-title">{aula.titulo}</span>
                  <div className="aula-list-status">
                    {isAssistida ? (
                      <span className="aula-list-check" title="Aula concluída">✓</span>
                    ) : (
                      <span className="aula-list-pending" title="Aula não assistida">○</span>
                    )}
                    {aula.duracao && (
                      <span className="aula-list-duration">{formatDuracao(aula.duracao)}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
      </main>
      
      <ThemeToggle />
    </div>
  );
}
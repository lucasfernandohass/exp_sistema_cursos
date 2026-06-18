import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiFetch from "../api";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";
import DashboardNavbar from "../components/DashboardNavbar";

import "../styles/atividade.css";

export default function AlunoAtividades() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [curso, setCurso] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [respostasCorretas, setRespostasCorretas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [modoRevisao, setModoRevisao] = useState(false);
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
      
      const atividadesComStatus = await Promise.all(
        (data || []).map(async (atividade) => {
          try {
            const status = await apiFetch(
              `/alunos/${user.id}/atividades/${atividade.id}/status`,
              { token }
            );
            return {
              ...atividade,
              respondida: status?.respondida || false,
              nota: status?.nota || null,
              questoesCorretas: status?.questoesCorretas || 0,
              totalQuestoes: status?.totalQuestoes || 10,
            };
          } catch {
            return { ...atividade, respondida: false, nota: null };
          }
        })
      );
      
      setAtividades(atividadesComStatus);
    } catch (err) {
      setError("Erro ao carregar atividades: " + err.message);
      setAtividades([]);
    }
  }, [cursoId, token, user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCurso();
      await fetchAtividades();
      setLoading(false);
    };
    loadData();
  }, [fetchCurso, fetchAtividades]);

  /* =========================
     BUSCAR RESPOSTAS DO ALUNO
  ========================= */
  async function fetchRespostasAluno(atividadeId, atividade) {
    try {
      const atividadeAtual = atividade || atividadeSelecionada;
      
      if (!atividadeAtual) {
        return;
      }
      
      const data = await apiFetch(
        `/alunos/${user.id}/atividades/${atividadeId}/respostas`,
        { token }
      );
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return;
      }
      
      const respostasMap = {};
      const respostasCorretasMap = {};
      
      data.forEach((item) => {
        const questaoIndex = atividadeAtual.questoes.findIndex(
          q => q.id === item.questaoId
        );
        
        if (questaoIndex !== -1) {
          const alternativaIndex = Number(item.alternativaIndex);
          const alternativaCorretaIndex = Number(item.alternativaCorretaIndex);
          const correta = item.correta === true || item.correta === 1 || item.correta === "true";
          
          respostasMap[questaoIndex] = alternativaIndex;
          respostasCorretasMap[questaoIndex] = {
            correta: correta,
            alternativaCorretaIndex: alternativaCorretaIndex,
          };
        }
      });
      
      setRespostas(respostasMap);
      setRespostasCorretas(respostasCorretasMap);
      
      let acertos = 0;
      Object.values(respostasCorretasMap).forEach(r => {
        if (r.correta) acertos++;
      });
      
      setAtividadeSelecionada(prev => ({
        ...prev,
        questoesCorretas: acertos,
      }));
      
    } catch (err) {
      showToast("Erro ao carregar correção da atividade", "error");
    }
  }

  /* =========================
     HANDLERS
  ========================= */
  function selecionarAtividade(atividade) {
    if (atividade.respondida) {
      setModoRevisao(true);
      setAtividadeSelecionada(atividade);
      fetchRespostasAluno(atividade.id, atividade);
      return;
    }
    
    setModoRevisao(false);
    setAtividadeSelecionada(atividade);
    setRespostasCorretas({});
    const respostasIniciais = {};
    atividade.questoes.forEach((_, idx) => {
      respostasIniciais[idx] = null;
    });
    setRespostas(respostasIniciais);
  }

  function voltarLista() {
    setAtividadeSelecionada(null);
    setModoRevisao(false);
    setRespostas({});
    setRespostasCorretas({});
    fetchAtividades();
  }

  function handleRespostaChange(questaoIndex, alternativaIndex) {
    if (modoRevisao) return;
    setRespostas(prev => ({
      ...prev,
      [questaoIndex]: alternativaIndex
    }));
  }

  function contarRespondidas() {
    return Object.values(respostas).filter(r => r !== null).length;
  }

  function todasRespondidas() {
    return atividadeSelecionada?.questoes?.length === contarRespondidas();
  }

  function getAlternativaClass(questaoIndex, alternativaIndex) {
    if (!modoRevisao) return "";
    
    const resposta = respostas[questaoIndex];
    const correta = respostasCorretas[questaoIndex];
    
    if (resposta === null || resposta === undefined) return "";
    
    const isSelected = resposta === alternativaIndex;
    const isCorrect = correta?.correta === true || correta?.correta === 1;
    
    if (isSelected) {
      return isCorrect ? "correta" : "errada";
    }
    
    if (correta?.alternativaCorretaIndex === alternativaIndex && !isSelected) {
      return "correta-destaque";
    }
    
    return "";
  }

  function getAlternativaIcon(questaoIndex, alternativaIndex) {
    if (!modoRevisao) return null;
    
    const resposta = respostas[questaoIndex];
    const correta = respostasCorretas[questaoIndex];
    
    if (resposta === null || resposta === undefined) return null;
    
    const isSelected = resposta === alternativaIndex;
    const isCorrect = correta?.correta === true || correta?.correta === 1;
    
    if (isSelected) {
      return isCorrect ? "✅" : "❌";
    }
    
    if (correta?.alternativaCorretaIndex === alternativaIndex && !isSelected) {
      return "✅";
    }
    
    return null;
  }

  async function handleEnviarRespostas() {
    if (!todasRespondidas()) {
      showToast("Responda todas as questões antes de enviar.", "error");
      return;
    }

    try {
      setEnviando(true);
      
      const payload = {
        atividadeId: atividadeSelecionada.id,
        respostas: atividadeSelecionada.questoes.map((q, idx) => ({
          questaoId: q.id,
          alternativaIndex: respostas[idx]
        }))
      };

      const response = await apiFetch(
        `/alunos/${user.id}/atividades/${atividadeSelecionada.id}/responder`,
        {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        }
      );

      await fetchRespostasAluno(atividadeSelecionada.id, atividadeSelecionada);
      
      setModoRevisao(true);
      
      setAtividades(prev => 
        prev.map(a => 
          a.id === atividadeSelecionada.id 
            ? { 
                ...a, 
                respondida: true,
                nota: response?.nota || 0,
                questoesCorretas: response?.questoesCorretas || 0,
                totalQuestoes: response?.totalQuestoes || 10,
              } 
            : a
        )
      );

      showToast(`Atividade concluída! Nota: ${(response?.nota || 0).toFixed(1)}`, "success");
      
    } catch (err) {
      showToast("Erro ao enviar atividade: " + err.message, "error");
    } finally {
      setEnviando(false);
    }
  }

  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
  }

  /* =========================
     LOADING / ERRO
  ========================= */
  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main">
          <div className="atividades-wrapper">
            <div className="atividades-header">
              <h1>Atividades</h1>
            </div>
            <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
          </div>
        </main>
        <ThemeToggle />
      </div>
    );
  }

  if (error && !curso) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main">
          <div className="atividades-wrapper">
            <div className="courses-error">
              <p>⚠️ {error}</p>
              <button className="btn-primary" onClick={() => navigate("/painel-aluno")}>
                Voltar ao Painel
              </button>
            </div>
          </div>
        </main>
        <ThemeToggle />
      </div>
    );
  }

  /* =========================
     RENDER - LISTA DE ATIVIDADES
  ========================= */
  if (!atividadeSelecionada) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main">
          <div className="atividades-wrapper">
            <div className="atividades-header">
              <h1>Atividades do Curso</h1>
              <p>{curso?.nome}</p>
            </div>

            {atividades.length === 0 ? (
              <div className="atividades-empty">
                <div className="atividades-empty-icon">📝</div>
                <h3>Nenhuma atividade disponível</h3>
                <p>Este curso ainda não possui atividades cadastradas.</p>
                <button className="btn-primary" onClick={() => navigate("/painel-aluno")}>
                  Voltar ao Painel
                </button>
              </div>
            ) : (
              <div className="atividades-grid">
                {atividades.map((atividade) => (
                  <div key={atividade.id} className={`atividade-card ${atividade.respondida ? "respondida" : ""}`}>
                    <div className="atividade-card-header">
                      <h3>{atividade.titulo}</h3>
                      <span className={`atividade-status-badge ${atividade.respondida ? "respondida" : "pendente"}`}>
                        {atividade.respondida ? "Respondida" : "Pendente"}
                      </span>
                    </div>
                    <p className="atividade-card-desc">{atividade.descricao}</p>
                    {atividade.respondida && (
                      <div className="atividade-resultado">
                        <span className="resultado-nota">Nota: {atividade.nota?.toFixed(1)}</span>
                        <span className="resultado-acertos">
                          {atividade.questoesCorretas}/{atividade.totalQuestoes} acertos
                        </span>
                      </div>
                    )}
                    <div className="atividade-card-footer">
                      <span className="atividade-questoes-count">
                        {atividade.questoes?.length || 0} questões
                      </span>
                      <button
                        className={`btn-primary ${atividade.respondida ? "btn-secondary" : ""}`}
                        onClick={() => selecionarAtividade(atividade)}
                      >
                        {atividade.respondida ? "Ver correção" : "Iniciar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        
        <ThemeToggle />
      </div>
    );
  }

  /* =========================
     RENDER - QUESTIONÁRIO OU REVISÃO
  ========================= */
  return (
    <div className="dashboard-layout">
      <DashboardNavbar />
      
      <main className="dashboard-main">
        <div className="atividades-wrapper">
          <div className="questionario-container">
            <div className="questionario-header">
              <button className="btn-secondary" onClick={voltarLista}>
                ← Voltar
              </button>
              <div className="questionario-info">
                <h2>{atividadeSelecionada.titulo}</h2>
                <p className="subtitulo">
                  {modoRevisao ? "📊 Correção da atividade" : atividadeSelecionada.descricao}
                </p>
              </div>
              {modoRevisao && (
                <div className="resultado-resumo">
                  <span className="nota">Nota: {(atividadeSelecionada.nota || 0).toFixed(1)}</span>
                  <span className="acertos">
                    {atividadeSelecionada.questoesCorretas || 0}/{atividadeSelecionada.totalQuestoes || 10} acertos
                  </span>
                </div>
              )}
            </div>

            {!modoRevisao && (
              <div className="questionario-progresso">
                <span className="label">{contarRespondidas()} de {atividadeSelecionada.questoes?.length || 0} respondidas</span>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(contarRespondidas() / (atividadeSelecionada.questoes?.length || 1)) * 100}%` 
                    }} 
                  />
                </div>
              </div>
            )}

            <div className="questoes-list">
              {atividadeSelecionada.questoes?.map((questao, qIdx) => (
                <div key={qIdx} className={`questao-card ${modoRevisao ? "modo-revisao" : ""}`}>
                  <div className="questao-header">
                    <span className="questao-numero">Questão {qIdx + 1}</span>
                    {modoRevisao && (
                      <span className={`questao-resultado ${respostasCorretas[qIdx]?.correta ? "correta" : "errada"}`}>
                        {respostasCorretas[qIdx]?.correta ? "✅ Correta" : "❌ Errada"}
                      </span>
                    )}
                    {!modoRevisao && (
                      <span className={`questao-status ${respostas[qIdx] !== null ? "respondida" : "pendente"}`}>
                        {respostas[qIdx] !== null ? "✓" : "○"}
                      </span>
                    )}
                  </div>
                  <p className="questao-enunciado">{questao.enunciado}</p>
                  <div className="alternativas-list">
                    {questao.alternativas?.map((alt, aIdx) => (
                      <label 
                        key={aIdx} 
                        className={`alternativa-item ${getAlternativaClass(qIdx, aIdx)}`}
                      >
                        <input
                          type="radio"
                          name={`questao_${qIdx}`}
                          checked={respostas[qIdx] === aIdx}
                          onChange={() => handleRespostaChange(qIdx, aIdx)}
                          disabled={modoRevisao}
                        />
                        <span className="alternativa-texto">
                          <span className="alternativa-letra">{String.fromCharCode(65 + aIdx)}.</span>
                          {alt.texto}
                        </span>
                        {modoRevisao && getAlternativaIcon(qIdx, aIdx) && (
                          <span className="icone-correcao">{getAlternativaIcon(qIdx, aIdx)}</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="questionario-footer">
              {!modoRevisao ? (
                <>
                  <div className="info">
                    <span>
                      {contarRespondidas()} de {atividadeSelecionada.questoes?.length || 0} questões respondidas
                    </span>
                    {todasRespondidas() && (
                      <span className="todas">✓ Todas respondidas!</span>
                    )}
                  </div>
                  <button
                    className="btn-primary"
                    onClick={handleEnviarRespostas}
                    disabled={enviando || !todasRespondidas()}
                  >
                    {enviando ? "Enviando..." : "Enviar respostas"}
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={voltarLista}>
                  Voltar para lista
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <ThemeToggle />
      
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
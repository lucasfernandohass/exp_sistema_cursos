const BASE_URL = "http://localhost:8080/api"

/* =========================
   FETCH BASE
========================= */

const apiFetch = async (path, { token, ...options } = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    })

    const contentType = res.headers.get("content-type")
    
    if (res.status === 204 || !contentType || !contentType.includes("application/json")) {
      if (res.status === 204) return null
      const text = await res.text()
      if (!text || text.trim() === "") return null
      throw new Error(text || `Erro ${res.status}`)
    }
    
    const data = await res.json()

    if (!res.ok) {
      const message = data?.mensagem || data?.message || `Erro ${res.status}`
      throw new Error(message)
    }

    return data
    
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Não foi possível conectar ao servidor.");
    }
    throw error;
  }
}

export default apiFetch

/* =========================
   AUTH
========================= */

export const login = (email, senha) =>
  apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  })

export const setupAdmin = (dados) =>
  apiFetch("/auth/setup", {
    method: "POST",
    body: JSON.stringify(dados),
  })

/* =========================
   ALUNOS
========================= */

export const registerAluno = (dados) =>
  apiFetch("/alunos", {
    method: "POST",
    body: JSON.stringify(dados),
  })

export const listarAlunos = (token) =>
  apiFetch("/alunos", { token })

export const detalharAluno = (id, token) =>
  apiFetch(`/alunos/${id}`, { token })

export const atualizarAluno = (id, dados, token) =>
  apiFetch(`/alunos/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(dados),
  })

export const deletarAluno = (id, token) =>
  apiFetch(`/alunos/${id}`, { method: "DELETE", token })

/* =========================
   PROFESSORES
========================= */

export const listarProfessores = (token) =>
  apiFetch("/professores", { token })

export const detalharProfessor = (id, token) =>
  apiFetch(`/professores/${id}`, { token })

export const criarProfessor = (dados, token) =>
  apiFetch("/professores", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

export const atualizarProfessor = (id, dados, token) =>
  apiFetch(`/professores/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(dados),
  })

export const deletarProfessor = (id, token) =>
  apiFetch(`/professores/${id}`, { method: "DELETE", token })

/* =========================
   CURSOS
========================= */

export const listarCursos = () =>
  apiFetch("/cursos")

export const pesquisarCursos = (termo) =>
  apiFetch(`/cursos/pesquisar?termo=${encodeURIComponent(termo)}`)

export const detalharCursoPublico = (id) =>
  apiFetch(`/cursos/${id}`)

export const detalharCurso = (id, token) =>
  apiFetch(`/cursos/${id}`, { token })

export const criarCurso = (dados, token) =>
  apiFetch("/cursos", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

export const atualizarCurso = (id, dados, token) =>
  apiFetch(`/cursos/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(dados),
  })

export const deletarCurso = (id, token) =>
  apiFetch(`/cursos/${id}`, { method: "DELETE", token })

export const avaliarCurso = (id, nota, token) =>
  apiFetch(`/cursos/${id}/avaliar`, {
    method: "POST",
    token,
    body: JSON.stringify({ nota }),
  })

/* =========================
   VIDEO AULAS
========================= */

export const listarAulasPorCurso = (cursoId, token) =>
  apiFetch(`/video-aulas?cursoId=${cursoId}`, { token })

export const detalharAula = (id, token) =>
  apiFetch(`/video-aulas/${id}`, { token })

export const criarAula = (dados, token) =>
  apiFetch("/video-aulas", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

export const atualizarAula = (id, dados, token) =>
  apiFetch(`/video-aulas/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(dados),
  })

export const excluirAula = (id, token) =>
  apiFetch(`/video-aulas/${id}`, { method: "DELETE", token })

/* =========================
   MATRÍCULAS
========================= */

export const matricular = (dados, token) =>
  apiFetch("/matriculas", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

export const listarMatriculas = (alunoId, token) =>
  apiFetch(`/matriculas/aluno/${alunoId}`, { token })

export const detalharMatricula = (alunoId, cursoId, token) =>
  apiFetch(`/matriculas/aluno/${alunoId}/curso/${cursoId}`, { token })

export const cancelarMatricula = (alunoId, cursoId, token) =>
  apiFetch(`/matriculas/aluno/${alunoId}/curso/${cursoId}`, {
    method: "DELETE",
    token,
  })

export const atualizarPagamento = (alunoId, cursoId, status, token) =>
  apiFetch(
    `/matriculas/aluno/${alunoId}/curso/${cursoId}/pagamento?status=${status}`,
    { method: "PATCH", token }
  )

export const gerarCobranca = (alunoId, cursoId, tipo, token) =>
  apiFetch(
    `/matriculas/aluno/${alunoId}/curso/${cursoId}/cobranca?tipo=${encodeURIComponent(tipo)}`,
    { method: "POST", token }
  )

export const registrarPagamento = (alunoId, cursoId, formaPagamento, token) =>
  apiFetch(`/matriculas/aluno/${alunoId}/curso/${cursoId}/pagamento`, {
    method: "POST",
    token,
    body: JSON.stringify({ formaPagamento }),
  })

export const gerarCobrancaCurso = (cursoId, tipo, token) =>
  apiFetch(
    `/matriculas/curso/${cursoId}/cobranca?tipo=${encodeURIComponent(tipo)}`,
    { method: "POST", token }
  )

export const registrarPagamentoCurso = (cursoId, formaPagamento, token) =>
  apiFetch(`/matriculas/curso/${cursoId}/pagamento`, {
    method: "POST",
    token,
    body: JSON.stringify({ formaPagamento }),
  })

/* =========================
   PROGRESSO
========================= */

export const marcarAulaAssistida = (alunoId, videoAulaId, token) =>
  apiFetch(`/progresso/aluno/${alunoId}/video-aula/${videoAulaId}`, {
    method: "POST",
    token,
  })

export const cursoConcluido = (alunoId, cursoId, token) =>
  apiFetch(`/progresso/aluno/${alunoId}/curso/${cursoId}/completo`, { token })

export async function emitirCertificado(alunoId, cursoId, token) {
  const response = await apiFetch(`/certificados/emitir?alunoId=${alunoId}&cursoId=${cursoId}`, {
    method: 'POST',
    token,
  });
  return response; // retorna o DTO com o código de validação
}

export function getCertificadoDownloadUrl(codigo) {
  return `/api/certificados/download/${codigo}`;
}

/* =========================
   DÚVIDAS
========================= */

export const enviarDuvida = (alunoId, dados, token) =>
  apiFetch(`/duvidas/aluno/${alunoId}`, {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

export const listarDuvidas = (videoAulaId, token) =>
  apiFetch(`/duvidas/video-aula/${videoAulaId}`, { token })

export const responderDuvida = (duvidaId, resposta, token) =>
  apiFetch(`/duvidas/${duvidaId}/responder`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ resposta }),
  })

export const listarDuvidasPendentes = (professorId, token) =>
  apiFetch(`/duvidas/professor/${professorId}/pendentes`, { token })

/* =========================
   ATIVIDADES
========================= */

export const listarAtividades = (videoAulaId, token) =>
  apiFetch(`/atividades/video-aula/${videoAulaId}`, { token })

export const criarAtividade = (dados, token) =>
  apiFetch("/atividades", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

export const atualizarAtividade = (id, dados, token) =>
  apiFetch(`/atividades/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(dados),
  })

export const deletarAtividade = (id, token) =>
  apiFetch(`/atividades/${id}`, { method: "DELETE", token })

/* =========================
   RESPOSTAS DE ATIVIDADES
========================= */

export const responderAtividade = (alunoId, atividadeId, respostas, token) =>
  apiFetch(`/alunos/${alunoId}/atividades/${atividadeId}/responder`, {
    method: "POST",
    token,
    body: JSON.stringify({ respostas }),
  });

export const listarRespostasPorAtividade = (atividadeId, token) =>
  apiFetch(`/respostas/atividade/${atividadeId}`, { token })

export const corrigirResposta = (respostaId, nota, token) =>
  apiFetch(`/respostas/${respostaId}/nota?nota=${nota}`, {
    method: "PATCH",
    token,
  })

/* =========================
   CERTIFICADOS
========================= */

export const listarCertificados = (alunoId, token) =>
  apiFetch(`/certificados/aluno/${alunoId}`, { token })

export const validarCertificado = (codigo) =>
  apiFetch(`/certificados/validar/${codigo}`)

/* =========================
   ADMINISTRADORES
========================= */

export const criarAdministrador = (dados, token) =>
  apiFetch("/administradores", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

/* =========================
   DASHBOARD / RELATÓRIOS
========================= */

export const getDashboardStats = (token) =>
  apiFetch("/admin/dashboard", { token })

export const getRelatorioMatriculas = (token, params) =>
  apiFetch(`/relatorios/matriculas?${new URLSearchParams(params)}`, { token })
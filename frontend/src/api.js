const BASE_URL = "http://localhost:8080/api"

/* =========================
   FETCH BASE
========================= */

const apiFetch = async (path, { token, ...options } = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    // tenta parsear o JSON de erro da API, senão usa texto cru
    const errorBody = await res.json().catch(() => null)
    const message =
      errorBody?.mensagem ||
      errorBody?.message ||
      `Erro ${res.status}`
    throw new Error(message)
  }

  return res.status === 204 ? null : res.json()
}

export default apiFetch

/* =========================
   AUTH
========================= */

/**
 * Login
 * POST /auth/login
 * Retorna: { token, tipo, id, nome, email }
 */
export const login = (email, senha) =>
  apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  })

/* =========================
   ALUNOS
========================= */

/**
 * Cadastrar aluno (público)
 * POST /alunos
 */
export const registerAluno = (dados) =>
  apiFetch("/alunos", {
    method: "POST",
    body: JSON.stringify(dados),
  })

/* =========================
   CURSOS
========================= */

/**
 * Listar todos os cursos (público)
 * GET /cursos
 * Retorna: CursoCardDTO[]
 * { id, nome, nomeProfessor, numeroAulas, cargaHoraria, preco, notaAvaliacao }
 */
export const listarCursos = () =>
  apiFetch("/cursos")

/**
 * Pesquisar cursos por termo (público)
 * GET /cursos/pesquisar?termo=
 * Retorna: CursoCardDTO[]
 */
export const pesquisarCursos = (termo) =>
  apiFetch(`/cursos/pesquisar?termo=${encodeURIComponent(termo)}`)

/**
 * Detalhar curso (público)
 * GET /cursos/{id}
 * Retorna: CursoDetalheDTO
 * { id, nome, ementa, cargaHoraria, numeroAulas, preco, notaAvaliacao,
 *   professor: { id, nome, email, formacao, telefone },
 *   videoAulas: [{ id, titulo, duracao, url, assistida }] }
 */
export const detalharCurso = (id) =>
  apiFetch(`/cursos/${id}`)

/* =========================
   MATRÍCULAS
========================= */

/**
 * Matricular aluno em curso
 * POST /matriculas
 * Body: { cursoId, modalidadePagamento: "AVISTA"|"PARCELADO", numeroParcelas }
 * Retorna: MatriculaResponseDTO
 */
export const matricular = (dados, token) =>
  apiFetch("/matriculas", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

/**
 * Listar matrículas do aluno
 * GET /matriculas/aluno/{alunoId}
 * Retorna: MatriculaResponseDTO[]
 * { cursoId, nomeCurso, nomeProfessor, totalAulas, aulasConcluidas,
 *   mediaFinal, modalidadePagamento, numeroParcelas,
 *   statusPagamento, dataMatricula, certificadoDisponivel }
 */
export const listarMatriculas = (alunoId, token) =>
  apiFetch(`/matriculas/aluno/${alunoId}`, { token })

/**
 * Detalhe de uma matrícula específica
 * GET /matriculas/aluno/{alunoId}/curso/{cursoId}
 * Retorna: MatriculaResponseDTO
 */
export const detalharMatricula = (alunoId, cursoId, token) =>
  apiFetch(`/matriculas/aluno/${alunoId}/curso/${cursoId}`, { token })

/**
 * Cancelar matrícula
 * DELETE /matriculas/aluno/{alunoId}/curso/{cursoId}
 */
export const cancelarMatricula = (alunoId, cursoId, token) =>
  apiFetch(`/matriculas/aluno/${alunoId}/curso/${cursoId}`, {
    method: "DELETE",
    token,
  })

/**
 * Atualizar status de pagamento
 * PATCH /matriculas/aluno/{alunoId}/curso/{cursoId}/pagamento?status=
 * status: "PENDENTE" | "PAGO" | "CANCELADO"
 */
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

/**
 * Marcar aula como assistida
 * POST /progresso/aluno/{alunoId}/video-aula/{videoAulaId}
 * Retorna: ProgressoAulaResponseDTO
 * { alunoId, videoAulaId, assistida, dataConclusao }
 */
export const marcarAulaAssistida = (alunoId, videoAulaId, token) =>
  apiFetch(`/progresso/aluno/${alunoId}/video-aula/${videoAulaId}`, {
    method: "POST",
    token,
  })

/**
 * Verificar se curso foi concluído (todas as aulas assistidas)
 * GET /progresso/aluno/{alunoId}/curso/{cursoId}/completo
 * Retorna: boolean
 */
export const cursoConcluido = (alunoId, cursoId, token) =>
  apiFetch(`/progresso/aluno/${alunoId}/curso/${cursoId}/completo`, { token })

/* =========================
   DÚVIDAS
========================= */

/**
 * Enviar dúvida sobre uma aula
 * POST /duvidas/{alunoId}
 * Body: { pergunta, videoAulaId }
 * Retorna: DuvidaResponseDTO
 */
export const enviarDuvida = (alunoId, dados, token) =>
  apiFetch(`/duvidas/${alunoId}`, {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

/**
 * Listar dúvidas de uma aula
 * GET /duvidas/video-aula/{videoAulaId}
 * Retorna: DuvidaResponseDTO[]
 */
export const listarDuvidas = (videoAulaId, token) =>
  apiFetch(`/duvidas/video-aula/${videoAulaId}`, { token })

/* =========================
   ATIVIDADES
========================= */

/**
 * Listar atividades de uma aula
 * GET /atividades/video-aula/{videoAulaId}
 * Retorna: AtividadeResponseDTO[]
 * { id, titulo, descricao, videoAulaId, respondida }
 */
export const listarAtividades = (videoAulaId, token) =>
  apiFetch(`/atividades/video-aula/${videoAulaId}`, { token })

/* =========================
   RESPOSTAS DE ATIVIDADES
========================= */

/**
 * Responder atividade
 * POST /respostas/{alunoId}
 * Body: { resposta, atividadeId }
 * Retorna: RespostaAtividadeResponseDTO
 */
export const responderAtividade = (alunoId, dados, token) =>
  apiFetch(`/respostas/${alunoId}`, {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  })

/* =========================
   CERTIFICADOS
========================= */

/**
 * Emitir certificado
 * POST /certificados/aluno/{alunoId}/curso/{cursoId}
 * Só funciona se todas as aulas foram assistidas e média >= 6.0
 * Retorna: CertificadoResponseDTO
 */
export const emitirCertificado = (alunoId, cursoId, token) =>
  apiFetch(`/certificados/aluno/${alunoId}/curso/${cursoId}`, {
    method: "POST",
    token,
  })

/**
 * Listar certificados do aluno
 * GET /certificados/aluno/{alunoId}
 * Retorna: CertificadoResponseDTO[]
 */
export const listarCertificados = (alunoId, token) =>
  apiFetch(`/certificados/aluno/${alunoId}`, { token })

/**
 * Validar certificado por código (público)
 * GET /certificados/validar/{codigo}
 * Retorna: CertificadoResponseDTO
 */
export const validarCertificado = (codigo) =>
  apiFetch(`/certificados/validar/${codigo}`)

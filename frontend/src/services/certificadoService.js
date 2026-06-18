import apiFetch from "../api";

/**
 * Emite um certificado para o aluno no curso especificado.
 * Retorna o objeto com o código de validação.
 */
export async function emitirCertificado(alunoId, cursoId) {
  const response = await apiFetch(`/certificados/emitir?alunoId=${alunoId}&cursoId=${cursoId}`, {
    method: "POST",
  });
  return response; // espera-se o DTO com codigoValidacao
}

/**
 * Baixa o PDF do certificado usando o código de validação.
 * Dispara o download automático.
 */
export async function downloadCertificado(codigo) {
  const response = await fetch(`/api/certificados/download/${codigo}`, {
    method: "GET",
    headers: {
      // se precisar de autorização, adicione
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao baixar certificado");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `certificado_${codigo}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
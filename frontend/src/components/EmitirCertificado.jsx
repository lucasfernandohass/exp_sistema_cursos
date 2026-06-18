import { useState } from "react";
import { emitirCertificado, downloadCertificado } from "../services/certificadoService";

export default function EmitirCertificado({ alunoId, cursoId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmitir = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Emitir certificado (obter código)
      const resultado = await emitirCertificado(alunoId, cursoId);
      const codigo = resultado.codigoValidacao;

      // 2. Baixar o PDF
      await downloadCertificado(codigo);

      // 3. Callback de sucesso (opcional)
      if (onSuccess) onSuccess(resultado);
    } catch (err) {
      console.error("Erro ao emitir certificado:", err);
      setError(err.message || "Erro ao emitir certificado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleEmitir}
        disabled={loading}
        className="btn-primary"
        style={{ minWidth: "150px" }}
      >
        {loading ? "Gerando..." : "📜 Emitir Certificado"}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
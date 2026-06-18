import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../api";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "../styles/validar.css";

export default function ValidarCertificado() {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  async function handleValidar(e) {
    e.preventDefault();
    if (!codigo.trim()) return;

    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const data = await apiFetch(`/certificados/validar/${codigo.trim()}`);
      setResultado(data);
    } catch (err) {
      setErro(err.message || "Certificado não encontrado ou inválido.");
    } finally {
      setLoading(false);
    }
  }

  function handleNovaConsulta() {
    setCodigo("");
    setResultado(null);
    setErro(null);
  }

  return (

    
    <div className="validar-page">
      <Navbar />
      <main className="validar-main">
        <div className="validar-container">
          <div className="validar-header">
            <h1>Validar Certificado</h1>
            <p>Digite o código de validação que aparece no certificado.</p>
          </div>

          <form className="validar-form" onSubmit={handleValidar}>
            <input
              type="text"
              placeholder="Código do Certificado"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="validar-input"
            />
            <button
              type="submit"
              disabled={loading || !codigo.trim()}
              className="validar-btn"
            >
              {loading ? "Validando..." : "Validar"}
            </button>
          </form>

          {erro && (
            <div className="validar-erro">
              <span className="validar-erro-icon">⚠️</span>
              <span>{erro}</span>
            </div>
          )}

          {resultado && (
            <div className="validar-resultado">
              <div className="validar-resultado-header">
                <span className="icone">✅</span>
                <h2>Certificado Válido</h2>
              </div>

              <div className="validar-resultado-info">
                <p>
                  <strong>Aluno:</strong>
                  <span>{resultado.nomeAluno}</span>
                </p>
                <p>
                  <strong>Curso:</strong>
                  <span>{resultado.nomeCurso}</span>
                </p>
                <p>
                  <strong>Data de emissão:</strong>
                  <span>
                    {new Date(resultado.dataEmissao).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
                <p>
                  <strong>Código:</strong>
                  <span className="codigo">{resultado.codigoValidacao}</span>
                </p>
              </div>

              <div className="validar-actions">
                <button className="btn-voltar" onClick={() => navigate("/")}>
                  Voltar ao início
                </button>
                <button className="btn-nova" onClick={handleNovaConsulta}>
                  Nova consulta
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ThemeToggle />
    </div>
  );
}
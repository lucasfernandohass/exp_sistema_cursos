import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listarCertificados } from "../api";
import DashboardNavbar from "../components/DashboardNavbar";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";

import "../styles/certificados.css";

export default function Certificados() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  useEffect(() => {
    async function fetchCertificados() {
      try {
        setLoading(true);
        const data = await listarCertificados(user.id, token);
        setCertificados(data || []);
      } catch (err) {
        setError(err.message);
        showToast("Erro ao carregar certificados: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    }
    fetchCertificados();
  }, [user, token]);

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

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardNavbar />
        <main className="dashboard-main">
          <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 60, borderRadius: 8 }} />
        </main>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DashboardNavbar />
      <main className="dashboard-main">
        <div className="certificados-header">
          <h1>Meus Certificados</h1>
          <p className="dashboard-subtitle">
            Certificados emitidos para os cursos que você concluiu.
          </p>
        </div>

        {certificados.length === 0 ? (
          <div className="certificados-empty">
            <div className="empty-icon"></div>
            <h3>Nenhum certificado emitido ainda</h3>
            <p>Conclua um curso para obter seu certificado.</p>
            <button className="btn-primary" onClick={() => navigate("/cursos")}>
              Ver cursos disponíveis
            </button>
          </div>
        ) : (
          <div className="certificados-grid">
            {certificados.map((cert) => (
              <div key={cert.id} className="certificado-card">
                <div className="certificado-icon">📜</div>
                <div className="certificado-info">
                  <h3>{cert.nomeCurso}</h3>
                  <p>Aluno: {cert.nomeAluno}</p>
                  <p>Professor: {cert.nomeProfessor}</p>
                  <span className="certificado-data">
                    Emitido em {formatDate(cert.dataEmissao)}
                  </span>
                </div>
                <div className="certificado-codigo">
                  <span>Código: {cert.codigoValidacao}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
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
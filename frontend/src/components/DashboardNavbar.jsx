import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import { useState } from "react";

export default function DashboardNavbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function isActive(path) {
    return location.pathname === path;
  }

  function handleLogoutClick() {
    setShowLogoutModal(true);
  }

  function handleConfirmLogout() {
    setShowLogoutModal(false);
    signOut();
  }

  function handleCancelLogout() {
    setShowLogoutModal(false);
  }

  return (
    <>
      <nav className="dash-nav">
        <div className="dash-nav-container">
          {/* Logo */}
          <Link to="/" className="dash-nav-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Aprenda+</span>
          </Link>

          {/* Links centrais */}
          <div className="dash-nav-links">
            <Link 
              to="/painel-aluno" 
              className={isActive("/painel-aluno") ? "active" : ""}
            >
              Meus Cursos
            </Link>
            <Link 
              to="/painel-aluno/minhas-informacoes" 
              className={isActive("/painel-aluno/minhas-informacoes") ? "active" : ""}
            >
              Minhas Informações
            </Link>
            <Link 
              to="/painel-aluno/certificados" 
              className={isActive("/painel-aluno/certificados") ? "active" : ""}
            >
              Certificados
            </Link>
            <span 
              className={`dash-nav-indicator ${location.pathname.startsWith("/painel-aluno/financeiro") ? "active" : ""}`}
            >
              Financeiro
            </span>
          </div>

          {/* Direita: usuário + logout */}
          <div className="dash-nav-right">
            <span className="dash-nav-user">
              {user?.nome?.split(" ")[0] || "Perfil"}
            </span>
            <button 
              className="dash-nav-logout"
              onClick={handleLogoutClick}  // agora abre o modal
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Modal de confirmação de logout */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Confirmar saída"
        message="Deseja realmente sair da sua conta?"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
}
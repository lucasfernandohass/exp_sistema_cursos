import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      id: "cursos",
      title: "Gerenciar Cursos",
      description: "Cadastre, edite e organize os cursos da plataforma, além das aulas e atividades dos mesmos.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 10L12 15L2 10L12 5L22 10Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 10V14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: "/admin/cursos",
      color: "cursos",
    },
    {
      id: "professores",
      title: "Gerenciar Professores",
      description: "Cadastre, edite e remova professores da plataforma.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: "/admin/professores",
      color: "professores",
    }
  ];

  return (
    <div className="admin-dashboard-page">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Aprenda+</span>
            <span className="admin-badge">Admin</span>
          </div>
        </div>

        <div className="admin-header-right">
          <div className="user-menu">
            <button className="user-pill-btn" onClick={() => setMenuOpen((v) => !v)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="user-pill-name">{user?.nome?.split(" ")[0]}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className={`user-pill-chevron${menuOpen ? " open" : ""}`}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="user-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="user-dropdown">
                  <div className="user-dropdown-name">{user?.nome}</div>
                  <div className="user-dropdown-email">{user?.email}</div>
                  <hr className="user-divider" />
                  <button
                    className="user-dropdown-item user-dropdown-logout"
                    onClick={() => { setMenuOpen(false); setShowConfirm(true) }}
                  >
                    Sair da conta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="admin-dashboard-main">
        <div className="admin-dashboard-container">
          {/* MENU CARDS */}
          <div className="admin-menu-grid">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`admin-menu-card admin-menu-card--${item.color}`}
                onClick={() => navigate(item.path)}
              >
                <div className="admin-menu-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <button className="admin-menu-btn">
                  Acessar →
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL LOGOUT */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box modal-box--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar logout</h2>
            </div>
            <p className="modal-delete-msg">Deseja realmente sair da sua conta?</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => { setShowConfirm(false); signOut() }}>Sair</button>
            </div>
          </div>
        </div>
      )}

      <ThemeToggle />
    </div>
  );
}
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children, title }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand">
            SPS React
          </Link>
          <div className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <Link to="/" className="nav-link">
                  Início
                </Link>
                <Link to="/users" className="nav-link">
                  Usuários
                </Link>
                <button
                  type="button"
                  className="btn btn-link nav-link text-decoration-none"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="container py-4">
        {title && (
          <h1 className="h4 text-muted mb-3">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
}

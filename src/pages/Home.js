import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout title="Início">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h5 card-title">SPS React Test</h2>
          <p className="text-muted mb-0">
            {isAuthenticated ? (
              <>
                Você está autenticado.{" "}
                <Link to="/users">Acessar lista de usuários</Link>.
              </>
            ) : (
              <>
                Faça <Link to="/login">login</Link> para ver e gerenciar usuários.
              </>
            )}
          </p>
        </div>
      </div>
    </Layout>
  );
}
